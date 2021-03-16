const { getPostData, getOptions } = require('utilities/helpers/postingData');
const { hiveClient, hiveOperations } = require('utilities/hiveApi');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const handleError = require('utilities/helpers/handleError');
const { actionTypes } = require('constants/index');
const config = require('config');

const markExpiredForecastOp = async (body) => {
  const accounts = await addBotsToEnv.setEnvData();
  if (accounts.error) return handleError(accounts.error.message);
  config.forecasts.account === accounts.serviceBots.length - 1
    ? config.forecasts.account = 0
    : config.forecasts.account += 1;
  const data = {
    ...body,
    title: '',
    body: `Forecast has ended with profitability of ${body.expForecast.profitability} pips`,
    permlink: `exp-${Number(new Date(body.expForecast.expiredAt))}`,
  };
  let error;

  for (let counter = 0; counter < accounts.serviceBots.length; counter++) {
    const account = accounts.serviceBots[config.forecasts.account];
    const { error: e, result: transactionStatus } = await sendComment(data, account);
    if (transactionStatus) {
      console.info('INFO[ForecastExpired] Expired forecast comment successfully created ');
      return {
        result: {
          status: 200,
          json:
                  {
                    permlink: data.permlink,
                    author: account.name,
                    transactionId: transactionStatus.id,
                  },
        },
      };
    } if (e && e.name === 'RPCError') {
      config.forecasts.account === accounts.serviceBots.length - 1
        ? config.forecasts.account = 0
        : config.forecasts.account += 1;
      console.warn(`ERR[ForecastExpired] RPCError: ${e.message}`);
      error = e.message;
      continue;
    }
    error = e.message;
    break;
  }
  console.error(`ERR[ForecastExpired] Set expired forecast failed | Error: ${error}`);
  return handleError(error);
};

const sendComment = async (data, account) => {
  console.info(`INFO[ForecastExpired] Try to write comment| bot: ${account.name}`);
  return hiveClient.execute(
    hiveOperations.postWithOptions,
    {
      comment: getPostData(data, account, actionTypes.FORECAST_EXPIRED),
      options: await getOptions(data, account, actionTypes.FORECAST_EXPIRED),
      key: account.postingKey,
    },
  );
};

module.exports = {
  markExpiredForecastOp,
};
