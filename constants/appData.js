module.exports = {
  telegramApi: {
    HOST: 'https://waiviodev.com',
    BASE_URL: '/telegram-api',
    SENTRY_ERROR: '/sentry',
  },
  appName: process.env.APP_NAME || 'waiviodev',
  version: process.env.APP_VERSION || '1.0.0',
  appAccName: process.env.APP_ACC_NAME || 'waivio',
  appObjectBeneficiaryAcc: process.env.APP_ACC_NAME || 'waivio.updates',
  appendObjectTag: process.env.APPEND_OBJECT_TAG || 'waivio-object',
  objectTypeTag: process.env.OBJECT_TYPE_TAG || 'waivio-object-type',
  engineTags: process.env.ENGINE_TAGS ? process.env.ENGINE_TAGS.split(',') : ['waivio'],
  nodeUrls: [
    // 'https://api.hive.blog',
    'https://api.deathwing.me',
    'https://api.openhive.network',
    'https://anyx.io',

  //  'https://hive.roelandp.nl',
    // 'https://api.pharesim.me',
  ],
};
