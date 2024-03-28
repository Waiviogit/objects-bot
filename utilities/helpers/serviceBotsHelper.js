const { ServiceBotsModel } = require('models');
const { cachedFunc } = require('./cacheHelper');

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
