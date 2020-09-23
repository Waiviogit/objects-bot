const axios = require('axios');
const { telegramApi } = require('../../constants/appData');

exports.sendSentryNotification = async () => {
  try {
    if (!['staging', 'production'].includes(process.env.NODE_ENV)) return;
    const result = await axios.get(`${telegramApi.HOST}${telegramApi.BASE_URL}${telegramApi.SENTRY_ERROR}?app=objectsBot`);
    return { result: result.data };
  } catch (error) {
    return { error };
  }
};
