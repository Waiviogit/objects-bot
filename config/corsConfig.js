const { redisGetter, redis } = require('utilities/redis');
const config = require('config');

const corsWhitelist = ['https://waiviodev.com', 'https://waivio.com', 'https://www.waivio.com'];

const parseJson = (string) => {
  try {
    return JSON.parse(string);
  } catch (error) {
    return [];
  }
};

const getWhiteList = async () => {
  const stringifiedList = await redisGetter.get({ key: 'cors_whitelist', client: redis.botsClient });
  return parseJson(stringifiedList);
};

const corsOptionsDelegate = async (req, callback) => {
  const whitelist = [...corsWhitelist, ...await getWhiteList()];
  const origin = req.header('Origin');
  const key = req.header('access-key');
  const serverCondition = !origin && key === config.accessKey;

  if (whitelist.indexOf(origin) > -1 || serverCondition) {
    return callback(null, true);
  }
  return callback(new Error('Not allowed by CORS'));
};

module.exports = {
  corsOptionsDelegate,
};
