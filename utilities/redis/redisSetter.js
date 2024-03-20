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

const setEx = async ({
  key, ttl, value, client = botsClient,
}) => {
  try {
    await client.setAsync(key, value);
    await client.expireAsync(key, ttl);
  } catch (error) {
    console.log(error.message);
  }
};

const del = async ({ key, client = botsClient }) => client.delAsync(key);

module.exports = {
  setActionsData,
  delActionsData,
  setSubscribe,
  setEx,
  del,
};
