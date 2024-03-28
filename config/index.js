const config = require('./config.json')[process.env.NODE_ENV || 'development'];

const envConfig = {
  mongoConnectionString: process.env.MONGO_URI_WAIVIO || `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`,
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8093,
  sentryDsn: process.env.SENTRY_DNS,
  apiKey: process.env.API_KEY,
  botsEncryptionKey: process.env.BOTS_ENCRYPTION_KEY,
  importBotKey: process.env.IMPORT_BOT_KEY,
  guestHotAccount: process.env.GUEST_HOT_ACC,
  guestHotKey: process.env.GUEST_HOT_KEY,
  appMemoKey: process.env.APP_MEMO_KEY,
  appAccName: process.env.APP_ACC_NAME || 'waivio',
  appObjectBeneficiaryAcc: process.env.APP_ACC_NAME || 'waivio.updates',
  appendObjectTag: process.env.APPEND_OBJECT_TAG || 'waivio-object',
  objectTypeTag: process.env.OBJECT_TYPE_TAG || 'waivio-object-type',
  engineTags: process.env.ENGINE_TAGS ? process.env.ENGINE_TAGS.split(',') : ['waivio'],
  appName: process.env.APP_NAME || 'waiviodev',
  version: process.env.APP_VERSION || '1.0.0',
};

const commonConfig = {
  telegramApi: {
    HOST: 'https://waiviodev.com',
    BASE_URL: '/telegram-api',
    SENTRY_ERROR: '/sentry',
  },
  nodeUrls: [
    // 'https://api.hive.blog',
    'https://api.deathwing.me',
    'https://api.openhive.network',
    'https://anyx.io',
  ],
};

const configObject = {
  ...config,
  ...envConfig,
  ...commonConfig,
};

/// freeze env and common config but leave fields from json because of counters
[...Object.keys(envConfig), ...Object.keys(commonConfig)].forEach(((field) => {
  Object.defineProperty(configObject, field, {
    value: configObject[field],
    writable: false,
    configurable: false,
  });
}));

module.exports = configObject;
