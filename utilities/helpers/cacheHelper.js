const redisGetter = require('../redis/redisGetter');
const redisSetter = require('../redis/redisSetter');
const { botsClient } = require('../redis/redis');
const jsonHelper = require('./jsonHelper');

const getCachedData = async (key) => {
  const resp = await redisGetter.get({
    key,
    client: botsClient,
  });

  return jsonHelper.parseJson(resp, null);
};

const setCachedData = async ({
  key,
  data,
  ttl,
}) => {
  await redisSetter.setEx({
    key, value: JSON.stringify(data), ttl,
  });
};

const cachedFunc = ({ func, ttlInSeconds }) => async (...args) => {
  const cacheKey = `objects_bot_cache:${func.name}${args?.length ? JSON.stringify(args) : ''}`;
  const cachedResult = await getCachedData(cacheKey);

  if (cachedResult) {
    return cachedResult;
  }

  const data = await func(...args);
  if (data.error) {
    return { error: data.error };
  }

  await setCachedData({
    key: cacheKey, data, ttl: ttlInSeconds,
  });

  return data;
};

module.exports = {
  setCachedData,
  getCachedData,
  cachedFunc,
};
