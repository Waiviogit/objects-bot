const { queueOperations, customJsonOperations } = require( '../utilities' );
const validationHelper = require( './validators/validationHelper' );
const authoriseUser = require( '../utilities/authorazation/authoriseUser' );

const proxyPosting = async ( req, res, next ) => { // add data to queue
    const comment = validationHelper.postingValidator( req.body, next );
    if( !comment ) return;

    const { error, isValid } = await authoriseUser.authorise( comment.commentData.author );
    if ( error ) return next( error );
    else if( isValid ) {
        const { result: timeToPublication, error: postingError } = await queueOperations.queueSwitcher( comment );

        if( postingError ) return next( postingError );

        res.result = { status: 200, json: timeToPublication };
        next();
    }
};

const proxyCustomJson = async( req, res, next ) => {
    const result = await customJsonOperations.switcher( req.body, next );

    if ( !result ) return;
    res.result = { status: 200 };
    next();
};


module.exports = {
    proxyPosting,
    proxyCustomJson
};
