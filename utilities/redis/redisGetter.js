const { actionsDataClient, botsClient } = require('utilities/redis/redis');

const getHashKeysAll = async (key) => {
  const result = await actionsDataClient.keysAsync(key);

  return { result };
};

const getAllHashData = async (key) => {
  const result = await actionsDataClient.getAsync(key);

  return { result };
};

const smembersAsync = async ({ key, client = botsClient }) => client.smembersAsync(key);

module.exports = { getHashKeysAll, getAllHashData, smembersAsync };
