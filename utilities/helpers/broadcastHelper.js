const { postModel } = require( '../../models' );
const { dsteemModel } = require( '../../models' );
const { redisGetter } = require( '../redis' );
const config = require( '../../config' );
const _ = require( 'lodash' );
const { accountsData, regExp } = require( '../../constants' );

const commentFinder = async ( author, permlink ) => {
    const { post } = await postModel.findOne( { author: author, permlink: permlink } );
    if ( post ) {
        return { author: post.root_author };
    }
};

const switcher = async ( message, account ) => {
    const { result: postingData } = await redisGetter.getAllHashData( message );
    let parsedData;

    try{
        parsedData = JSON.parse( postingData );
        if ( !parsedData.comment.parent_author ) { // check post to exists in base, if exist -> it is update
            const checkInBase = await commentFinder( parsedData.comment.author, parsedData.comment.permlink );
            if ( _.has( checkInBase, 'author' ) ) return await updateHelper( checkInBase.author, parsedData.comment );
        }
        if ( parsedData.comment.parent_author && parsedData.comment.guest_root_author ) {
            return await updateHelper( parsedData.comment.guest_root_author, _.omit( parsedData.comment, [ 'guest_root_author' ] ) );
        }
    }catch( e ) {
        return { error: e };
    }
    const post = parsedData.comment;
    console.info( `Try to create comment by | ${account.name}` );
    post.body = `${post.body}\n This message was written by guest ${post.author}, and is 
    [available at ${config.waivio_auth.host}](https://${config.waivio_auth.host}/@${account.name}/${post.permlink})`;
    post.author = account.name;
    if( _.has( post, 'post_root_author' ) ) post.parent_author = post.post_root_author;
    if ( !_.has( parsedData, 'options' ) ) return await dsteemModel.post( post, account.postingKey );
    const options = parsedData.options;
    options.author = account.name;
    const { result, error } = await dsteemModel.postWithOptions( post, parsedData.options, account.postingKey );
    if ( error && error.message.match( 'beneficiaries' ) ) return await dsteemModel.post( post, account.postingKey );
    return { result, error };
};

const updateHelper = async ( author, comment ) => {
    const root_acc = _.find( accountsData.guestOperationAccounts, ( acc ) => acc.name === author );
    comment.author = root_acc.name;
    if( _.has( comment, 'post_root_author' ) ) comment.parent_author = comment.post_root_author;
    const { result: updateResult, error: updateError } = await dsteemModel.post( comment, root_acc.postingKey );
    if ( updateResult )return { result: updateResult };
    if ( regExp.steemErrRegExp.test( updateError.message ) ) return{ error: { message: 'update error' } };
    return{ error: updateError };
};

module.exports = { switcher };

