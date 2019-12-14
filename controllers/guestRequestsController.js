const { queueOperations, postingData, customJsonOperations } = require( '../utilities' );
const validators = require( './validators' );
const authoriseUser = require( '../utilities/authorazation/authoriseUser' );
const { dsteemModel } = require( '../models' );


const proxyPosting = async ( req, res, next ) => { // add data to queue
    const value = validators.validate( req.body, validators.posting.Schema, next );

    if( !value ) return;
    const preparedData = postingData.preparePostData( value.data.operations[ 0 ], value.data.operations[ 1 ] );
    const { error, isValid } = await authoriseUser.authorise( preparedData.post.author );

    if ( error ) return next( error );
    else if( isValid ) {
        const { result: timeToPublication, error: postingError } = await queueOperations.queueSwitcher( preparedData );

        if( postingError ) return next( postingError );

        res.result = { status: 200, json: timeToPublication };
        next();
    }
};

const proxyCustomJson = async( req, res, next ) => {
    const { error, value } = await customJsonOperations.switcher( req.body );

    if ( error ) return next( error );
    else if( value ) {
        const { result, error: postingError } = await dsteemModel.customJSON( value );

        if( postingError ) return next( postingError );

        res.result = { status: 200 };
    }
};

module.exports = {
    proxyPosting,
    proxyCustomJson
};
