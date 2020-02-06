const handleError = require('utilities/helpers/handleError');
const { getPostData, getOptions } = require('utilities/helpers/postingData');
const { dsteemModel } = require('models');
const { actionTypes, accountsData } = require('constants/index');
const config = require('config');

const markExpiredForecastOp = async (body) => {
  config.forecasts.account === accountsData.basicAccounts.length - 1
    ? config.forecasts.account = 0
    : config.forecasts.account += 1;
  const data = {
    ...body,
    title: '',
    body: `Forecast has ended with profitability of ${body.expForecast.profitability} pips`,
    permlink: `exp-${Number(new Date(body.expForecast.expiredAt))}`,
  };
  let error;

  for (let counter = 0; counter < accountsData.basicAccounts.length; counter++) {
    const account = accountsData.basicAccounts[config.forecasts.account];
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
      config.forecasts.account === accountsData.basicAccounts.length - 1
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
  return dsteemModel.postWithOptions(
    getPostData(data, account, actionTypes.FORECAST_EXPIRED), await getOptions(data, account, actionTypes.FORECAST_EXPIRED),
    account.postingKey,
  );
};

module.exports = {
  markExpiredForecastOp,
};
