const { actionsDataClient, botsClient, lastBlockClient } = require('utilities/redis/redis');
const { WHITE_LIST_KEY } = require('../../constants/importObjects');

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

const isNameInWhiteList = async (name) => {
  try {
    const result = await botsClient.sismemberAsync(WHITE_LIST_KEY, name);

    return result === 1;
  } catch (error) {
    return false;
  }
};

module.exports = {
  getHashKeysAll, getAllHashData, smembersAsync, get, getHashAll, isNameInWhiteList,
};
