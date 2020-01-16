const { regExp } = require( '../../constants' );

module.exports = ( error ) => {
    const statusCode = regExp.steemErrRegExp.test( error ) ? 503 : 422;

    return{ error: { status: statusCode, message: error } };
};
