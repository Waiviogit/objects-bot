const { uuid } = require('uuidv4');
const redisGetter = require('utilities/redis/redisGetter');
const redisSetter = require('utilities/redis/redisSetter');
const { actionsRsmqClient, redisQueue } = require('utilities/redis/rsmq');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const updateMetadata = require('utilities/helpers/updateMetadata');
const _ = require('lodash');

const getKey = (sendData, actionData) => (actionData.qname === 'delete_post' ? sendData.data.root_author : sendData.comment.author);

// Create queue if it not exist, and add "data" to this queue
const addToQueue = async (sendData, actionData) => {
  const key = getKey(sendData, actionData);

  const { error: createError } = await redisQueue.createQueue(
    { client: actionsRsmqClient, qname: actionData.qname },
  );

  if (createError) return { error: { status: 500, message: createError } };
  const { result: currentUserComments } = await redisGetter.getHashKeysAll(`${actionData.operation}:${key}:*`);

  if (currentUserComments.length >= actionData.limit) {
    return { error: { status: 429, message: `To many comments from ${key} in queue` } };
  }
  if (_.get(sendData, 'comment.json_metadata')) sendData.comment.json_metadata = updateMetadata.metadataModify(sendData.comment.json_metadata);

  const messageId = `${actionData.operation}:${key}:${uuid()}`;

  const { error: sendMessError } = await redisQueue.sendMessage({
    client: actionsRsmqClient,
    qname: actionData.qname,
    message: messageId,
  });
  const redisDataError = await redisSetter.setActionsData(messageId, JSON.stringify(sendData));

  if (sendMessError || redisDataError) {
    return { error: { status: 503, message: sendMessError || redisDataError } };
  }
  const result = { waitingTime: await timeToPosting(actionData) };

  return { result };
};

// get all items in queue, get count and return time for posting all items
const timeToPosting = async (actionData) => {
  const { result: allQueueItems = [] } = await redisGetter.getHashKeysAll(`${actionData.operation}:*`);
  const accounts = await addBotsToEnv.setEnvData();

  if (actionData.operation === 'proxy-post') {
    // eslint-disable-next-line max-len
    return ((Math.ceil(((allQueueItems.length * actionData.rechargeTime) / accounts.proxyBots.length) / 5) * 5) - 5);
  }
  // eslint-disable-next-line max-len
  return Math.round((allQueueItems.length * actionData.rechargeTime) / accounts.proxyBots.length);
};

module.exports = { addToQueue };
