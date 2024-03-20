const { actionsDataClient, redisNotifyClient, botsClient } = require('utilities/redis/redis');

const setActionsData = async (key, data) => {
  try {
    await actionsDataClient.setAsync(key, data);
  } catch (error) {
    return { error };
  }
};

const delActionsData = async (key) => {
  if (key) {
    await actionsDataClient.del(key);
  }
};

const setSubscribe = async (key, subscriber) => redisNotifyClient.saddAsync(key, subscriber);

const setEx = ({
  key, ttl, value, client = botsClient,
}) => client.setAsync(key, value, { EX: ttl });

const del = async ({ key, client = botsClient }) => client.delAsync(key);

module.exports = {
  setActionsData,
  delActionsData,
  setSubscribe,
  setEx,
  del,
};
