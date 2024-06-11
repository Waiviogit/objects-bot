const { redisGetter, redis } = require('utilities/redis');

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

const corsOptions = {
  origin: async (origin, cb) => {
    const whitelist = [...corsWhitelist, ...await getWhiteList()];

    if (whitelist.indexOf(origin) > -1 || !origin) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
};

module.exports = {
  corsOptions,
};
