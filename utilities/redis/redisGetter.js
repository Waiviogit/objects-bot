const { actionsDataClient, botsClient, lastBlockClient } = require('utilities/redis/redis');

const getHashKeysAll = async (key) => {
  const result = await actionsDataClient.keysAsync(key);

  return { result };
};

const getAllHashData = async (key) => {
  const result = await actionsDataClient.getAsync(key);

  return { result };
};

const smembersAsync = async ({ key, client = botsClient }) => client.smembersAsync(key);

const get = async ({ key, client = actionsDataClient }) => client.getAsync(key);

const getHashAll = async (key, client = lastBlockClient) => client.hgetallAsync(key);

module.exports = {
  getHashKeysAll, getAllHashData, smembersAsync, get, getHashAll,
};
