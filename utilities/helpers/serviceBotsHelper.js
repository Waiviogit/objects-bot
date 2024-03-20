const jsonHelper = require('utilities/helpers/jsonHelper');
const { CACHE_SERVICE_BOTS } = require('constants/redisBlockNames');
const { ServiceBotsModel } = require('models');
const { getCachedData, setCachedData } = require('./cacheHelper');

exports.setEnvData = async () => {
  const cache = await getCachedData(CACHE_SERVICE_BOTS);
  if (cache) {
    console.log('CACHE');
    return jsonHelper.parseJson(cache, {});
  }

  const { result, error } = await ServiceBotsModel.getAllServiceBots();

  if (error) return { error };

  await setCachedData({ key: CACHE_SERVICE_BOTS, data: result, ttl: 60 * 60 });
  return result;
};

(async () => {
  const yo = await this.setEnvData();
  console.log();
})();
