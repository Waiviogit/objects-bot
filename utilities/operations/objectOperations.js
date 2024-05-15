const { getPostData, getOptions, getAppendRequestBody } = require('utilities/helpers/postingData');
const checkUsersForBlackList = require('utilities/helpers/checkUsersForBlackList');
const permlinkGenerator = require('utilities/helpers/permlinkGenerator');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const handleError = require('utilities/helpers/handleError');
const { hiveOperations } = require('utilities/hiveApi');
const { actionTypes } = require('constants/index');
const config = require('config');
const { voteForField } = require('./importVote');
const { decryptKey } = require('../helpers/encryptionHelper');

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
    const comment = getPostData(data, account, actionTypes.CREATE_OBJECT_TYPE);
    const options = await getOptions(data, account, actionTypes.CREATE_OBJECT_TYPE);
    const { error: e, result: transactionStatus } = await hiveOperations
      .postWithOptions({ comment, options, key: decryptKey(account.postingKey) });

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
      accounts,
      account,
      body: updBody,
      opType: actionTypes.CREATE_OBJECT,
      fromImport: !!body.datafinityObject,
    });
    if (e === 'Not enough mana') continue;
    if (transactionStatus) {
      console.info('INFO[CreateObject] Successfully created');
      console.info('INFO[CreateObject] Recall Append object');
      if (body.datafinityObject) {
        return {
          result: {
            status: 200,
            json: {
              author: account.name,
              permlink: updBody.permlink,
              parentAuthor: updBody.parentAuthor,
              parentPermlink: updBody.parentPermlink,
              transactionId: transactionStatus.id,
              block_num: transactionStatus.block_num,
            },
          },
        };
      }
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
      accounts,
      account,
      body: updBody,
      opType: actionTypes.APPEND_OBJECT,
      fromImport: !!body.importingAccount,
    });
    if (transactionStatus && body.importingAccount) {
      await voteForField({
        voter: body.importingAccount,
        author: account.name,
        permlink: body.permlink,
        authorPermlink: body.parentPermlink,
        fieldType: body.field.name,
      });
    }
    if (e === 'Not enough mana') continue;
    if (transactionStatus) {
      const payload = {
        author: account.name,
        permlink: updBody.permlink,
        parentAuthor: updBody.parentAuthor,
        parentPermlink: updBody.parentPermlink,
        transactionId: transactionStatus.id,
        block_num: transactionStatus.block_num,
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
  account, body, opType, accounts, fromImport,
}) => {
  const minPercentToBroadcast = fromImport
    ? 7500
    : 7000;

  const { result: percentRc } = await hiveOperations.getAccountRCPercentage(account.name);

  if (percentRc <= minPercentToBroadcast) {
    config.objects.account === accounts.serviceBots.length - 1
      ? config.objects.account = 0
      : config.objects.account += 1;
    console.error(`Bot ${account.name} has few RS`);
    return { e: 'Not enough mana' };
  }
  console.info(`INFO[${opType}] Try | bot: ${account.name} | request body: ${JSON.stringify(body)}`);
  const comment = getPostData(body, account, opType);
  const options = await getOptions(body, account);
  const { error: e, result: transactionStatus } = await hiveOperations
    .postWithOptions({ comment, options, key: decryptKey(account.postingKey) });

  return { e, transactionStatus };
};

module.exports = { createObjectTypeOp, createObjectOp, AppendObjectOp };
