const permlinkGenerator = require('utilities/helpers/permlinkGenerator');
const handleError = require('utilities/helpers/handleError');
const { dsteemModel } = require('models');
const { getPostData, getOptions, getAppendRequestBody } = require('utilities/helpers/postingData');
const checkUsersForBlackList = require('utilities/helpers/checkUsersForBlackList');
const { actionTypes } = require('constants/index');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const config = require('config');

const createObjectTypeOp = async (body) => {
  const accounts = await addBotsToEnv.setEnvData();
  if (accounts.error) return handleError(accounts.error.message);
  config.objects.account === accounts.serviceBots.length - 1
    ? config.objects.account = 0
    : config.objects.account += 1;
  const data = { ...body, permlink: permlinkGenerator(body.objectType) };
  let error;
  for (let counter = 0; counter < accounts.serviceBots.length; counter++) {
    const account = accounts.serviceBots[config.objects.account];
    console.info(`INFO[CreateObjectType] Try to create object type | bot: ${account.name} | request body: ${JSON.stringify(body)}`);
    const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
      getPostData(data, account, actionTypes.CREATE_OBJECT_TYPE),
      await getOptions(data, account, actionTypes.CREATE_OBJECT_TYPE),
      account.postingKey,
    );

    if (transactionStatus) {
      const payload = {
        transactionId: transactionStatus.id,
        author: account.name,
        permlink: data.permlink,
      };
      console.info(`INFO[CreateObjectType] Object type successfully created | response body: ${JSON.stringify(payload)}`);
      return { result: { status: 200, json: payload } };
    } if (e && e.name === 'RPCError') {
      config.objects.account === accounts.serviceBots.length - 1
        ? config.objects.account = 0
        : config.objects.account += 1;
      error = e.message;
      console.warn(`ERR[CreateObjectType] RPCError: ${e.message}`);
      continue;
    }
    error = e.message;
    break;
  }
  console.error(`ERR[CreateObjectType] Create type failed | Error: ${error}`);
  return handleError(error);
};

const createObjectOp = async (body) => {
  const { body: updBody, error: publishError, accounts } = await publishHelper({ ...body });
  if (publishError) return handleError(publishError);
  let error;
  for (let counter = 0; counter < accounts.serviceBots.length; counter++) {
    const account = accounts.serviceBots[config.objects.account];
    const { e, transactionStatus } = await dataPublisher({
      accounts, account, body: updBody, opType: actionTypes.CREATE_OBJECT,
    });
    if (e === 'Not enough mana') continue;
    if (transactionStatus) {
      console.info('INFO[CreateObject] Successfully created');
      console.info('INFO[CreateObject] Recall Append object');
      return AppendObjectOp(getAppendRequestBody(updBody, account));
    } if (e && e.name === 'RPCError') {
      config.objects.account === accounts.serviceBots.length - 1
        ? config.objects.account = 0
        : config.objects.account += 1;
      error = e.message;
      console.warn(`ERR[CreateObject] RPCError: ${e.message}`);
      continue;
    }
    error = e.message;
    break;
  }
  console.error(`ERR[CreateObject] Create failed | Error: ${error}`);
  return handleError(error);
};

const AppendObjectOp = async (body) => {
  const { body: updBody, error: publishError, accounts } = await publishHelper({ ...body });
  if (publishError) return handleError(publishError);
  let error;
  for (let counter = 0; counter < accounts.serviceBots.length; counter++) {
    const account = accounts.serviceBots[config.objects.account];
    const { e, transactionStatus } = await dataPublisher({
      accounts, account, body: updBody, opType: actionTypes.APPEND_OBJECT,
    });
    if (e === 'Not enough mana') continue;
    if (transactionStatus) {
      const payload = {
        author: account.name,
        permlink: updBody.permlink,
        parentAuthor: updBody.parentAuthor,
        parentPermlink: updBody.parentPermlink,
        transactionId: transactionStatus.id,
      };
      console.info(`INFO[AppendObject] Successfully appended | response body: ${JSON.stringify(payload)}`);
      return { result: { status: 200, json: payload } };
    } if (e && e.name === 'RPCError') {
      config.objects.account === accounts.serviceBots.length - 1
        ? config.objects.account = 0
        : config.objects.account += 1;
      console.warn(`ERR[AppendObject] RPCError: ${e.message}`);
      error = e.message;
      continue;
    }
    error = e.message;
    break;
  }
  console.error(`ERR[AppendObject] Append failed | Error: ${error}`);
  return handleError(error);
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
  if (await dsteemModel.getAccountRC(account.name) < 2100000000) {
    config.objects.account === accounts.serviceBots.length - 1
      ? config.objects.account = 0
      : config.objects.account += 1;
    console.error(`Bot ${account.name} has few RS`);
    return { e: 'Not enough mana' };
  }
  console.info(`INFO[${opType}] Try | bot: ${account.name} | request body: ${JSON.stringify(body)}`);
  const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
    getPostData(body, account, opType),
    await getOptions(body, account),
    account.postingKey,
  );
  return { e, transactionStatus };
};

module.exports = { createObjectTypeOp, createObjectOp, AppendObjectOp };
