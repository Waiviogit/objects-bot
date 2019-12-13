const { postingOperations } = require( '../utilities/operations' );
const validators = require( './validators' );
const authoriseUser = require( '../utilities/authorazation/authoriseUser' );

const proxyPosting = async ( req, res, next ) => { // add data to queue
    const value = validators.validate( req.body, validators.posting.Schema, next );

    if( !value ) return;
    const { error, isValid } = await authoriseUser.authorise( value.author );

    if ( error ) return next( error );
    else if( isValid ) {
        const { result: timeToPublication, error: postingError } = await postingOperations.queueSwitcher( value );

        if( postingError ) return next( postingError );

        res.result = { status: 200, json: timeToPublication };
        next();
    }
};

module.exports = {
    proxyPosting
};
