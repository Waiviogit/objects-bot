const { redisQueue, actionsRsmqClient } = require( '../redis/rsmq' );
const { redisGetter, redisSetter } = require( '../redis' );
const { accountsData, regExp, guestRequestsData } = require( '../../constants' );
const { dsteemModel } = require( '../../models' );
const config = require( '../../config' );
const _ = require( 'lodash' );

const postBroadcaster = async ( noMessageWait = 6000, postingErrorWait = 60000 ) => {
    const { error: redisError, result: message } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: guestRequestsData.postAction.qname
    } );

    if ( redisError ) {
        if ( redisError.message === 'No messages' ) {
            // console.error( `ERR[PostBroadcasting] ${redisError.message}` );
            await new Promise( ( r ) => setTimeout( r, noMessageWait ) );
            return;
        }
    }
    if ( message ) {
        const account = accountsData.guestOperationAccounts[ config.guest_comment.account ];
        const { error: broadcastError, result: transactionStatus } = await broadcastingSwitcher( message.message, account );

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
            return;
        }
        await redisQueue.deleteMessage( { client: actionsRsmqClient, qname: guestRequestsData.postAction.qname, id: message.id } );
        await redisSetter.delActionsData( message.message );
    }
};

const commentBroadcaster = async ( noMessageWait = 10000, postingErrorWait = 10000 ) => {
    const { error: redisError, result: message } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: guestRequestsData.commentAction.qname
    } );

    if ( redisError ) {
        if ( redisError.message === 'No messages' ) {
            // console.error( `ERR[CommentBroadcasting] ${redisError.message}` );
            await new Promise( ( r ) => setTimeout( r, noMessageWait ) );
            return;
        }
    }
    if ( message ) {
        const account = accountsData.guestOperationAccounts[ config.guest_comment.accountForComm ];
        const { error: broadcastError, result: transactionStatus } = await broadcastingSwitcher( message.message, account );

        if( transactionStatus ) {
            config.guest_comment.accountForComm === accountsData.guestOperationAccounts.length - 1 ? config.guest_comment.accountForComm = 0 : config.guest_comment.accountForComm += 1;
            config.guest_comment.attemptsComm = 0;
            console.info( `INFO[PostBroadcasting] Post successfully send | transaction id ${transactionStatus.id}` );
        } else if ( config.guest_comment.attemptsComm === ( accountsData.guestOperationAccounts.length - 1 ) ) {
            console.error( `ERR[PostBroadcasting] RPCError: ${broadcastError.message}` );
            await new Promise( ( resolve ) => setTimeout( resolve, postingErrorWait ) );
            config.guest_comment.attemptsComm = 0;
            return;
        } else if ( broadcastError && regExp.steemErrRegExp.test( broadcastError.message ) ) {
            console.warn( `ERR[PostBroadcasting] RPCError: ${broadcastError.message}` );
            config.guest_comment.attemptsComm += 1;
            config.guest_comment.accountForComm === accountsData.guestOperationAccounts.length - 1 ? config.guest_comment.accountForComm = 0 : config.guest_comment.accountForComm += 1;
            return;
        }
        await redisQueue.deleteMessage( { client: actionsRsmqClient, qname: guestRequestsData.commentAction.qname, id: message.id } );
        await redisSetter.delActionsData( message.message );
    }
};

const broadcastingSwitcher = async ( message, account ) => {
    const { result: postingData } = await redisGetter.getAllHashData( message );
    let parsedData;

    try{
        parsedData = JSON.parse( postingData );
    }catch( error ) {
        return { error };
    }
    const post = parsedData.comment;
    console.info( `Try to create comment by | ${account.name}` );
    post.body = `${post.body}\n This message was written by guest ${post.author}, and is [available at ${config.waivio_auth.host}](https://${config.waivio_auth.host}/@${post.author}/${post.permlink})`;
    post.author = account.name;
    if ( !_.has( parsedData, 'options' ) ) return await dsteemModel.post( post, account.postingKey );
    const options = parsedData.options;
    options.author = account.name;
    const { result, error } = await dsteemModel.postWithOptions( post, parsedData.options, account.postingKey );
    if ( error && error.message.match( 'beneficiaries' ) ) return await dsteemModel.post( post, account.postingKey );
    return {result, error};
};

module.exports = { postBroadcaster, commentBroadcaster };

