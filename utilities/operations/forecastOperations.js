const handleError = require( '../helpers/handleError' );
const { getPostData, getOptions } = require( '../helpers/postingData' );
const { dsteemModel } = require( '../../models' );
const { actionTypes, accountsData } = require( '../../constants' );

const markExpiredForecastOp = async ( body ) => {
    let error = '';
    const data = {
        ...body,
        title: '',
        body: `Forecast has ended with profitability of ${body.expForecast.profitability} pips`,
        permlink: `exp-${Number( new Date( body.expForecast.expiredAt ) )}`
    };

    for( let account of accountsData.basicAccounts ) {
        console.info( `INFO[ForecastExpired] Try to write comment| bot: ${account.name}` );
        const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
            getPostData( data, account, actionTypes.FORECAST_EXPIRED ),
            getOptions( data, account, actionTypes.FORECAST_EXPIRED ),
            account.postingKey
        );

        if( transactionStatus ) {
            console.info( 'INFO[ForecastExpired] Expired forecast comment successfully created ' );
            return { result: { status: 200, json: { permlink: data.permlink, author: account.name } } };
        } else if ( e && e.name === 'RPCError' ) {
            console.warn( `ERR[ForecastExpired] RPCError: ${e.message}` );
            error = e.message;
            continue;
        }
        return handleError( e.message );
    }
    console.error( `ERR[ForecastExpired] Set expired forecast failed | Error: ${error}` );
    return handleError( error );
};

module.exports = {
    markExpiredForecastOp
};
