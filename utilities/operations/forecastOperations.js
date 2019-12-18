const handleError = require( '../helpers/handleError' );
const { getPostData, getOptions } = require( '../helpers/postingData' );
const { dsteemModel } = require( '../../models' );
const { actionTypes, accountsData } = require( '../../constants' );
const config = require( '../../config' );

const markExpiredForecastOp = async ( body ) => {
    const data = {
        ...body,
        title: '',
        body: `Forecast has ended with profitability of ${body.expForecast.profitability} pips`,
        permlink: `exp-${Number( new Date( body.expForecast.expiredAt ) )}`
    };
    let account = accountsData.basicAccounts[ config.forecasts.account ];

    console.info( `INFO[ForecastExpired] Try to write comment| bot: ${account.name}` );
    const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
        getPostData( data, account, actionTypes.FORECAST_EXPIRED ),
        getOptions( data, account, actionTypes.FORECAST_EXPIRED ),
        account.postingKey
    );

    if( transactionStatus ) {
        console.info( 'INFO[ForecastExpired] Expired forecast comment successfully created ' );
        config.forecasts.account === accountsData.basicAccounts.length - 1 ? config.forecasts.account = 0 : config.forecasts.account += 1;
        config.forecasts.attempts = 0;
        return { result: { status: 200, json: { permlink: data.permlink, author: account.name, transactionId: transactionStatus.id } } };
    } else if ( e && e.name === 'RPCError' && config.forecasts.attempts < accountsData.basicAccounts.length - 1 ) {
        config.forecasts.account === accountsData.basicAccounts.length - 1 ? config.forecasts.account = 0 : config.forecasts.account += 1;
        config.forecasts.attempts += 1;
        console.warn( `ERR[ForecastExpired] RPCError: ${e.message}` );
        await markExpiredForecastOp( body );
    }
    if ( config.forecasts.attempts === accountsData.basicAccounts.length - 1 || e.name !== 'RPCError' ) {
        console.error( `ERR[ForecastExpired] Set expired forecast failed | Error: ${e.message}` );
    }
    config.forecasts.attempts = 0;
    return handleError( e.message );
};

module.exports = {
    markExpiredForecastOp
};
