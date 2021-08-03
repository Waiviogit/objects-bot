module.exports = {
  telegramApi: {
    HOST: 'https://waiviodev.com',
    BASE_URL: '/telegram-api',
    SENTRY_ERROR: '/sentry',
  },
  appName: process.env.APP_NAME || 'waiviodev',
  version: process.env.APP_VERSION || '1.0.0',
  appAccName: process.env.APP_ACC_NAME || 'waivio',
  appendObjectTag: process.env.APPEND_OBJECT_TAG || 'waivio-object',
  objectTypeTag: process.env.OBJECT_TYPE_TAG || 'waivio-object-type',
  nodeUrls: [
    'https://api.hive.blog',
    'https://rpc.esteem.app',
    'https://anyx.io',
    'https://hive.roelandp.nl',
    'https://rpc.ausbit.dev',
  ],
};
