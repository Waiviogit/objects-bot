const { redisQueue, actionsRsmqClient } = require('utilities/redis/rsmq');
const { redisSetter } = require('utilities/redis');
const { regExp } = require('constants/index');
const config = require('config');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const broadcastHelper = require('utilities/helpers/broadcastHelper');

const commentBroadcaster = async ({
  noMessageWait = 10000, postingErrorWait = 10000, qname, path,
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
    const result = await broadcastStatusParse(message.message, path, postingErrorWait, qname);
    if (!result) {
      await redisQueue.deleteMessage(
        { client: actionsRsmqClient, qname, id: message.id },
      );
      await redisSetter.delActionsData(message.message);
    }
  }
};

const broadcastStatusParse = async (message, path, postingErrorWait, qname) => {
  const accounts = await addBotsToEnv.setEnvData();

  const account = accounts.proxyBots[config[path].account];
  const { error, result } = await broadcastHelper.switcher(message, account);
  if (result) {
    config[path].account === accounts.proxyBots.length - 1
      ? config[path].account = 0
      : config[path].account += 1;
    config[path].attempts = 0;
    console.info(`INFO[commentBroadcasting] Comment successfully send | transaction id ${result.id}`);
    return false;
  } if (error && regExp.steemErrRegExp.test(error.message)) {
    if (config[path].attempts === (accounts.proxyBots.length - 1)) {
      console.error(`ERR[commentBroadcasting] RPCError: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, postingErrorWait));
      config[path].attempts = 0;
      return true;
    }
    console.warn(`ERR[commentBroadcasting] RPCError: ${error.message}`);
    config[path].attempts += 1;
    config[path].account === accounts.proxyBots.length - 1
      ? config[path].account = 0
      : config[path].account += 1;
    return true;
  } if (path === 'guest_post' && error && error.message === 'update error') {
    await redisQueue.sendMessage(
      {
        client: actionsRsmqClient,
        qname,
        message,
      },
    );
  }
  return false;
};

module.exports = { commentBroadcaster };
