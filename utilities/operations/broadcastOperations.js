const { redisQueue, actionsRsmqClient } = require( '../redis/rsmq' );
const { redisGetter, redisSetter } = require( '../redis' );
const { accountsData, regExp, guestRequestsData } = require( '../../constants' );
const { dsteemModel } = require( '../../models' );
const config = require( '../../config' );
const _ = require( 'lodash' );

const postBroadcaster = async ( noMessageWait = 5000, postingErrorWait = 60000 ) => {
    const account = accountsData.guestOperationAccounts[ config.guest_comment.account ];
    const { error: redisError, result: queueMessage } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: guestRequestsData.postAction.qname
    } );

    if ( redisError ) {
        console.error( redisError.message );
        await new Promise( ( resolve ) => setTimeout( resolve, noMessageWait ) );
        config.guest_comment.attempts = 0;
        return;
    }
    const { error: broadcastError, result: transactionStatus } = await broadcastingSwitcher( queueMessage.message, account );

    if( transactionStatus ) {
        config.guest_comment.account === accountsData.guestOperationAccounts.length - 1 ? config.guest_comment.account = 0 : config.guest_comment.account += 1;
        config.guest_comment.attempts = 0;
        console.info( `INFO[PostBroadcasting] Post successfully send | transaction id ${transactionStatus.id}` );
    } else if ( config.guest_comment.attempts === ( accountsData.guestOperationAccounts.length - 1 ) ) {
        console.error( `ERR[PostBroadcasting] RPCError: ${broadcastError.message}` );
        await new Promise( ( resolve ) => setTimeout( resolve, postingErrorWait ) );
        config.guest_comment.attempts = 0;
        return;
    } else if ( broadcastError && regExp.steemErrRegExp.test( broadcastError.message ) ) {
        console.warn( `ERR[PostBroadcasting] RPCError: ${broadcastError.message}` );
        config.guest_comment.attempts += 1;
        config.guest_comment.account === accountsData.guestOperationAccounts.length - 1 ? config.guest_comment.account = 0 : config.guest_comment.account += 1;
        await postBroadcaster( noMessageWait, postingErrorWait );
        return;
    }
    await redisQueue.deleteMessage( { client: actionsRsmqClient, qname: guestRequestsData.postAction.qname, id: queueMessage.id } );
    await redisSetter.delActionsData( queueMessage.message );
};

const commentBroadcaster = async ( noMessageWait = 5000 ) => {
    const account = accountsData.guestOperationAccounts[ config.guest_comment.account ];
    const { error: redisError, result: queueMessage } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: guestRequestsData.commentAction.qname
    } );

    if ( redisError || !queueMessage ) {
        console.error( redisError.message || 'Queue is empty' );
        await new Promise( ( resolve ) => setTimeout( resolve, noMessageWait ) );
        return;
    }
    const { error: broadcastError } = await broadcastingSwitcher( queueMessage.message, account );

    if ( broadcastError && regExp.steemErrRegExp.test( broadcastError.message ) ) {
        console.warn( `ERR[PostBroadcasting] RPCError: ${broadcastError.message}` );
        config.guest_comment.account === accountsData.guestOperationAccounts.length - 1 ? config.guest_comment.account = 0 : config.guest_comment.account += 1;
        return;
    }
    config.guest_comment.account === accountsData.guestOperationAccounts.length - 1 ? config.guest_comment.account = 0 : config.guest_comment.account += 1;
    await redisQueue.deleteMessage( { client: actionsRsmqClient, qname: guestRequestsData.commentAction.qname, id: queueMessage.id } );
    await redisSetter.delActionsData( queueMessage.message );
};


const broadcastingSwitcher = async ( message, account ) => {
    const { result: postingData } = await redisGetter.getAllHashData( message );
    let parsedData;

    try{
        parsedData = JSON.parse( postingData );
    }catch( error ) {
        return { error };
    }
    const post = parsedData.commentData;
    console.info( `Try to create comment by | ${account.name}` );
    post.body = `${post.body}\n This message was written by guest ${post.author}, and is available at ${config.waivio_auth.host}/@${post.author}/${post.permlink}`;
    post.author = account.name;
    if ( !_.has( parsedData, 'options' ) ) return await dsteemModel.post( post, account.postingKey );

    return await dsteemModel.postWithOptions( post, parsedData.options, account.postingKey );
};

module.exports = { postBroadcaster, commentBroadcaster };

