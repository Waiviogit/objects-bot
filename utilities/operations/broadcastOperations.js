const { redisQueue, actionsRsmqClient } = require('utilities/redis/rsmq');
const { redisSetter } = require('utilities/redis');
const { regExp } = require('constants/index');
const config = require('config');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const broadcastHelper = require('utilities/helpers/broadcastHelper');
const { LAST_BLOCK_NUM } = require('constants/redisBlockNames');

const commentBroadcaster = async ({
  noMessageWait = 1000, postingErrorWait = 10000, qname, path, botType,
}) => {
  const { error: redisError, result: message } = await redisQueue.receiveMessage({
    client: actionsRsmqClient, qname,
  });

  if (redisError) {
    if (redisError.message === 'No messages') {
      await new Promise((r) => setTimeout(r, noMessageWait));
      return;
    }
  }
  if (message) {
    const result = await broadcastStatusParse(message.message, path, postingErrorWait, qname, botType);
    if (!result) {
      await redisQueue.deleteMessage(
        { client: actionsRsmqClient, qname, id: message.id },
      );
      await redisSetter.delActionsData(message.message);
    }
  }
};

const broadcastStatusParse = async (message, path, postingErrorWait, qname, botType) => {
  const accounts = await addBotsToEnv.setEnvData();
  const account = accounts[botType][config[path].account];
  const { error, result, guestAuthor } = await broadcastHelper.switcher(message, account);
  if (result) {
    config[path].account === accounts[botType].length - 1
      ? config[path].account = 0
      : config[path].account += 1;
    config[path].attempts = 0;
    await redisSetter.setSubscribe(`${LAST_BLOCK_NUM}:${result.block_num}`, guestAuthor);
    console.info(`INFO[commentBroadcasting] Comment successfully send | transaction id ${result.id}`);
    return false;
  } if (error && regExp.steemErrRegExp.test(error.message)) {
    if (config[path].attempts === (accounts[botType].length - 1)) {
      console.error(`ERR[commentBroadcasting] RPCError: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, postingErrorWait));
      config[path].attempts = 0;
      return true;
    }
    console.warn(`ERR[commentBroadcasting] RPCError: ${error.message}`);
    config[path].attempts += 1;
    config[path].account === accounts[botType].length - 1
      ? config[path].account = 0
      : config[path].account += 1;
    return true;
  } if (path === 'guest_post' && error && error.message === 'update error') {
    await redisQueue.sendMessage({
      client: actionsRsmqClient,
      qname,
      message,
    });
  }
  return false;
};

module.exports = { commentBroadcaster };
