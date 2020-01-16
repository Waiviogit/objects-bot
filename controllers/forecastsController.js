const { forecastOperations } = require( '../utilities' );

const markForecastAsExpired = async ( req, res, next ) => {
    const { error, result } = await forecastOperations.markExpiredForecastOp( req.body );

    if( error ) return next( error );
    res.result = result;
    next();
};

module.exports = {
    markForecastAsExpired
};
