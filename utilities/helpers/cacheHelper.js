const { redisGetter, redisSetter } = require('../redis');
const { botsClient } = require('../redis/redis');

const getCachedData = async (key) => {
  const { result: resp } = await redisGetter.get({
    key,
    client: botsClient,
  });

  return resp;
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

module.exports = {
  setCachedData,
  getCachedData,
};
