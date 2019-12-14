const { redisQueue, actionsRsmqClient } = require( '../redis/rsmq' );
const { redisGetter, redisSetter } = require( '../redis' );
const { accountsData, regExp, guestRequestsData } = require( '../../constants' );
const { dsteemModel } = require( '../../models' );
const config = require( '../../config' );
const _ = require( 'lodash' );

const postBroadcaster = async ( noMessageWait = 5000, postingErrorWait = 60000 ) => {
    const account = accountsData.guestOperationAccounts[ config.posting_account ];
    const { error: redisError, result: queueMessage } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: guestRequestsData.postAction.qname
    } );

    if ( redisError ) {
        console.log( redisError.message );
        await new Promise( ( resolve ) => setTimeout( resolve, noMessageWait ) );
        config.posting_counter = 0;
        return;
    }

    const { error: broadcastError } = await broadcastingSwitcher( queueMessage.message, account);

    if ( broadcastError && regExp.steemErrRegExp.test( broadcastError.message ) ) {
        config.posting_account === accountsData.guestOperationAccounts.length - 1 ? config.posting_account = 0 : config.posting_account += 1;
        return;
    }
    await redisQueue.deleteMessage( { client: actionsRsmqClient, qname: guestRequestsData.postAction.qname, id: queueMessage.id } );
    await redisSetter.delActionsData( queueMessage.message );
    if ( config.posting_counter === ( accountsData.guestOperationAccounts.length - 1 ) ) {
        await new Promise( ( resolve ) => setTimeout( resolve, postingErrorWait ) );
        config.posting_counter = 0;
    }
    config.posting_counter++;
};

const commentBroadcaster = async ( noMessageWait = 5000 ) => {
    const account = accountsData.guestOperationAccounts[ config.comment_account ];
    const { error: redisError, result: queueMessage } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: guestRequestsData.commentAction.qname
    } );

    if ( redisError || !queueMessage ) {
        console.log( redisError.message || 'Queue is empty' );
        await new Promise( ( resolve ) => setTimeout( resolve, noMessageWait ) );
        return;
    }
    const { error: broadcastError } = await broadcastingSwitcher( queueMessage.message, account );

    if ( broadcastError && regExp.steemErrRegExp.test( broadcastError.message ) ) {
        config.comment_account === accountsData.guestOperationAccounts.length - 1 ? config.comment_account = 0 : config.comment_account += 1;
        return;
    }
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
    const post = parsedData.post;

    post.body = `${post.body}\n This message was written by guest ${post.author}, and is available at ${config.waivio_auth.host}/@${post.author}/${post.permlink}`;
    if ( !_.has( parsedData, 'comment_options.extensions' ) ) return await dsteemModel.post( post, account.postingKey );
    const options = parsedData.comment_options;

    return await dsteemModel.postWithOptions( post, options, account.postingKey );
};

module.exports = { postBroadcaster, commentBroadcaster };

