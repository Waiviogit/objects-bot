const { commentHelper, postHelper } = require( '../helpers' );
const { commentAction, postAction } = require( '../constants/guestRequestsData' );

const processComment = async ( req, res, next ) => { // add comment to queue
    const { result: timeToPublication, error: commentError } = await commentHelper.addCommentToQueue( req.body, commentAction );

    if( commentError ) {
        return next( { status: commentError.status || 422, message: commentError.message } );
    }
    res.result = { status: 200, json: timeToPublication };
    next();
};

const processPost = async ( req, res, next ) => { // add post to queue
    const { result: timeToPublication, error: postError } = await postHelper.addPostToQueue( req.body, postAction );

    if( postError ) {
        return next( { status: postError.status || 422, message: postError.message } );
    }
    res.result = { status: 200, json: timeToPublication };
    next();
};

module.exports = {
    processComment,
    processPost
};
