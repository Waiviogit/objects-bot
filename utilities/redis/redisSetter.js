const { actionsDataClient, redisNotifyClient } = require('utilities/redis/redis');

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

module.exports = {
  setActionsData,
  delActionsData,
  setSubscribe,
};
