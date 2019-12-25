const { dsteemModel } = require( '../../models' );
const updateMetadata = require( './updateMetadata' );
const _ = require( 'lodash' );

exports.validateComment = async ( comment, next ) => {
    const metadata = updateMetadata.parseMetadata( comment.json_metadata, next );
    if ( _.get( metadata, 'comment.userId' ) !== comment.author ) {
        return next( { error: { message: 'Comment not found!', status: 404 } } );
    }
    const{ error } = await dsteemModel.getComment( comment.guest_root_author, comment.permlink );
    if ( error ) return next( { error: error } );

    return { result: true };
};
