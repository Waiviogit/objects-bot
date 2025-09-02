const { redisGetter, redis } = require('utilities/redis');
const config = require('config');

const corsWhitelist = [
  'https://waiviodev.com',
  'https://waivio.com',
  'https://www.waivio.com',
  'https://www.youtube.com',
  'https://www.tiktok.com',
  'https://www.tiktok.com',
  'https://www.instagram.com',
  'https://3speak.tv',
];

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
  if (/objects-bot\/docs/.test(req.path)) return callback(null, true);

  const whitelist = [...corsWhitelist, ...await getWhiteList()];
  const origin = req.header('Origin');
  const key = req.header('access-key');
  const serverCondition = !origin && config.accessKeys.includes(key);

  if (whitelist.indexOf(origin) > -1 || serverCondition) {
    return callback(null, true);
  }
  return callback({ status: 401 });
};

module.exports = {
  corsOptionsDelegate,
};
