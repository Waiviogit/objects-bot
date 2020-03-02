const permlinkGenerator = require('utilities/helpers/permlinkGenerator');
const handleError = require('utilities/helpers/handleError');
const { dsteemModel } = require('models');
const { getPostData, getOptions, getAppendRequestBody } = require('utilities/helpers/postingData');
const { checkForBlackList } = require('utilities/helpers/checkUsersForBlackList');
const { actionTypes } = require('constants/index');
const addBotsToEnv = require('utilities/operations/addBotsToEnv');
const config = require('config');

const createObjectTypeOp = async (body) => {
  const accounts = await addBotsToEnv.setEnvData();
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
  if (await checkForBlackList(body.author)) return handleError('Author in blackList!');
  const accounts = await addBotsToEnv.setEnvData();
  body.permlink = body.permlink.replace('_', '-');
  config.objects.account === accounts.serviceBots.length - 1
    ? config.objects.account = 0
    : config.objects.account += 1;
  let error;
  for (let counter = 0; counter < accounts.serviceBots.length; counter++) {
    const account = accounts.serviceBots[config.objects.account];
    console.info(`INFO[CreateObject] Try create | bot: ${account.name} | request body: ${JSON.stringify(body)}`);
    const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
      getPostData(body, account, actionTypes.CREATE_OBJECT),
      await getOptions(body, account),
      account.postingKey,
    );
    if (transactionStatus) {
      console.info('INFO[CreateObject] Successfully created');
      console.info('INFO[CreateObject] Recall Append object');
      return AppendObjectOp(getAppendRequestBody(body, account));
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
  if (await checkForBlackList(body.author)) return handleError('Author in blackList!');
  const accounts = await addBotsToEnv.setEnvData();
  body.permlink = body.permlink.replace('_', '-');
  config.objects.account === accounts.serviceBots.length - 1
    ? config.objects.account = 0
    : config.objects.account += 1;
  let error;
  for (let counter = 0; counter < accounts.serviceBots.length; counter++) {
    const account = accounts.serviceBots[config.objects.account];
    console.info(`INFO[AppendObject] Try append | bot: ${account.name} | request body: ${JSON.stringify(body)}`);
    const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
      getPostData(body, account, actionTypes.APPEND_OBJECT),
      await getOptions(body, account),
      account.postingKey,
    );
    if (transactionStatus) {
      const payload = {
        author: account.name,
        permlink: body.permlink,
        parentAuthor: body.parentAuthor,
        parentPermlink: body.parentPermlink,
        transactionId: transactionStatus.id,
      };
      console.info(`INFO[CreateObjectType] Object type successfully created | response body: ${JSON.stringify(payload)}`);
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

module.exports = { createObjectTypeOp, createObjectOp, AppendObjectOp };
