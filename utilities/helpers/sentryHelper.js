const axios = require('axios');
const config = require('config');
const Sentry = require('@sentry/node');

const { telegramApi } = config;

exports.sendSentryNotification = async () => {
  try {
    if (!['staging', 'production'].includes(config.environment)) return;
    const result = await axios.get(`${telegramApi.HOST}${telegramApi.BASE_URL}${telegramApi.SENTRY_ERROR}?app=objectsBot&env=${config.environment}`);
    return { result: result.data };
  } catch (error) {
    return { error };
  }
};

exports.sentryCaptureException = async (error = {}) => {
  Sentry.captureException({ error });
  await this.sendSentryNotification();
  return false;
};
