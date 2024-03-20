const { ServiceBotsModel } = require('models');
const { cachedFunc } = require('./cacheHelper');
const { decryptKey } = require('./encryptionHelper');

const getServiceBots = async () => {
  const { result, error } = await ServiceBotsModel.getAllServiceBots();
  if (error) return { error };
  return result;
};

const setEnvData = cachedFunc({
  func: getServiceBots, ttlInSeconds: 60 * 5,
});

module.exports = {
  setEnvData,
};
