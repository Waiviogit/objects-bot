const { getPostData, getOptions, getAppendRequestBody } = require('utilities/helpers/postingData');
const checkUsersForBlackList = require('utilities/helpers/checkUsersForBlackList');
const { captureAndSendError } = require('utilities/helpers/sentryHelper');
const permlinkGenerator = require('utilities/helpers/permlinkGenerator');
const { hiveClient, hiveOperations } = require('utilities/hiveApi');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const handleError = require('utilities/helpers/handleError');
const { MAX_COMMENTS } = require('constants/wobjectsData');
const { actionTypes } = require('constants/index');
const { objectTypeModel } = require('models');
const config = require('config');
const _ = require('lodash');

const createObjectTypeOp = async (body) => {
  const { body: updBody, error: publishError, accounts } = await publishHelper(
    { ...body, permlink: permlinkGenerator(body.objectType, 10) },
  );
  if (publishError) return handleError(publishError);

  return publishDataWithBots({
    opType: actionTypes.CREATE_OBJECT_TYPE,
    callback: createObjectTypeCallback,
    body: updBody,
    accounts,
  });
};

const createObjectOp = async (body) => {
  const {
    parentAuthor, parentPermlink, error: objTypeErr,
  } = await getObjectTypeAuthorPermlink(body.type);
  if (objTypeErr) return captureAndSendError(objTypeErr);

  const { body: updBody, error: publishError, accounts } = await publishHelper(
    { ...body, parentAuthor, parentPermlink },
  );
  if (publishError) return handleError(publishError);

  return publishDataWithBots({
    opType: actionTypes.CREATE_OBJECT,
    callback: createObjectCallback,
    body: updBody,
    accounts,
  });
};

const AppendObjectOp = async (body) => {
  const { maxComments, objectType } = await isMaxComments(body.root);
  if (maxComments) return transferObjectUpdates({ body, objectType });

  const { body: updBody, error: publishError, accounts } = await publishHelper(body);
  if (publishError) return handleError(publishError);

  return publishDataWithBots({
    opType: actionTypes.APPEND_OBJECT,
    callback: appendObjectCallback,
    body: updBody,
    accounts,
  });
};

const transferObjectUpdates = async ({ body, objectType }) => {
  const { parentAuthor, parentPermlink } = await getObjectTypeAuthorPermlink(objectType);
  const updateComment = {
    permlink: permlinkGenerator(body.author_permlink, 10),
    author_permlink: body.author_permlink,
    parentAuthor,
    parentPermlink,
  };

  const { body: updBody, error: publishError, accounts } = await publishHelper(updateComment);
  if (publishError) return handleError(publishError);

  return publishDataWithBots({
    additionalData: body,
    opType: actionTypes.TRANSFER_UPDATES,
    callback: transferObjectCallback,
    body: updBody,
    accounts,
  });
};

const publishHelper = async (body) => {
  if (await checkUsersForBlackList.checkForBlackList(body.author)) return { error: 'Author in blackList!' };
  const accounts = await addBotsToEnv.setEnvData();
  if (accounts.error) return { error: accounts.error.message };
  body.permlink = body.permlink.replace('_', '-');
  body.permlink = body.permlink.replace('.', '');
  config.objects.account === accounts.serviceBots.length - 1
    ? config.objects.account = 0
    : config.objects.account += 1;
  return { body, accounts };
};

const dataPublisher = async ({
  account, body, opType, accounts,
}) => {
  if (await hiveOperations.getAccountRC(account.name) < 2100000000) {
    config.objects.account === accounts.serviceBots.length - 1
      ? config.objects.account = 0
      : config.objects.account += 1;
    console.error(`Bot ${account.name} has few RS`);
    return { e: 'Not enough mana' };
  }
  console.info(`INFO[${opType}] Try | bot: ${account.name} | request body: ${JSON.stringify(body)}`);
  const { error: e, result: transactionStatus } = await hiveClient.execute(
    hiveOperations.postWithOptions,
    {
      comment: getPostData(body, account, opType),
      options: await getOptions(body, account, opType),
      key: account.postingKey,
    },
  );

  return { e, transactionStatus };
};

const publishDataWithBots = async ({
  body, opType, accounts, additionalData, callback,
}) => {
  let error;

  for (let counter = 0; counter < accounts.serviceBots.length; counter++) {
    const account = accounts.serviceBots[config.objects.account];
    const { e, transactionStatus } = await dataPublisher({
      accounts, account, body, opType,
    });
    if (transactionStatus) {
      return callback({
        transactionStatus, account, body, additionalData,
      });
    }
    if (e === 'Not enough mana') continue;
    if (e && e.name === 'RPCError') {
      config.objects.account === accounts.serviceBots.length - 1
        ? config.objects.account = 0
        : config.objects.account += 1;
      error = e.message;
      continue;
    }
    error = e.message;
    break;
  }
  return handleError(error);
};

const getObjectTypeAuthorPermlink = async (type) => {
  let newType;
  const { result = [], error } = await objectTypeModel
    .find({ name: type, commentsNum: { $lt: MAX_COMMENTS } });
  if (error) return { error };

  if (_.isEmpty(result)) {
    ({ result: newType } = await createObjectTypeOp({ objectType: type }));
    if (!newType) return { error: { message: `Error while creating objectType: ${type}` } };
  }
  if (result.length < 2) await createObjectTypeOp({ objectType: type });

  return {
    parentAuthor: newType ? _.get(newType, 'json.author') : _.get(result, '[0].author'),
    parentPermlink: newType ? _.get(newType, 'json.permlink') : _.get(result, '[0].permlink'),
  };
};

const isMaxComments = async ({ author, permlink }) => {
  const { result } = await objectTypeModel.findOne({ author, permlink });

  return {
    maxComments: MAX_COMMENTS < result.commentsNum,
    objectType: result.name,
  };
};

const transferObjectCallback = async ({ account, body, additionalData }) => {
  additionalData.parentAuthor = account.name;
  additionalData.parentPermlink = body.permlink;

  return AppendObjectOp(additionalData);
};

const appendObjectCallback = async ({ account, body, transactionStatus }) => {
  const payload = {
    author: account.name,
    permlink: body.permlink,
    parentAuthor: body.parentAuthor,
    parentPermlink: body.parentPermlink,
    transactionId: transactionStatus.id,
    block_num: transactionStatus.block_num,
  };

  return { result: { status: 200, json: payload } };
};

const createObjectCallback = async ({ account, body }) => AppendObjectOp(getAppendRequestBody(body, account));

const createObjectTypeCallback = async ({ transactionStatus, account, body }) => {
  const payload = {
    transactionId: transactionStatus.id,
    author: account.name,
    permlink: body.permlink,
  };

  return { result: { status: 200, json: payload } };
};

module.exports = { createObjectTypeOp, createObjectOp, AppendObjectOp };
