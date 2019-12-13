const { redisQueue, actionsRsmqClient } = require( '../redis/rsmq' );
const { redisGetter, redisSetter } = require( '../redis' );
const { postAction, commentAction } = require( '../../constants/guestRequestsData' );
const { accountsData } = require( '../../constants/accountsData' );
const { actionTypes } = require( '../../constants/actionTypes' );
const { dsteemModel } = require( '../../models' );
const config = require( '../../config' );
const { steemErrRegExp } = require( '../../constants/regExp' );
const postHelper = require( '../helpers/postingDataHelper' );
const _ = require( 'lodash' );

const postBroadcaster = async ( noMessageWait = 5000, postingErrorWait = 60000 ) => {
    const account = accountsData[ config.posting_account ];
    const { error: redisError, result: queueMessage } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: postAction.qname
    } );

    if ( redisError ) {
        console.log( redisError.message );
        await new Promise( ( resolve ) => setTimeout( resolve, noMessageWait ) );
        config.posting_counter = 0;
        return;
    }

    const { error: broadcastError } = await broadcastingSwitcher( queueMessage.message, account, actionTypes.GUEST_POST );

    if ( broadcastError && steemErrRegExp.test( broadcastError.message ) ) {
        config.posting_account === accountsData.length - 1 ? config.posting_account = 0 : config.posting_account += 1;
        return;
    }
    await redisQueue.deleteMessage( { client: actionsRsmqClient, qname: postAction.qname, id: queueMessage.id } );
    await redisSetter.delActionsData( queueMessage.message );
    if ( config.posting_counter === ( accountsData.length - 1 ) ) {
        await new Promise( ( resolve ) => setTimeout( resolve, postingErrorWait ) );
        config.posting_counter = 0;
    }
    config.posting_counter++;
};

const commentBroadcaster = async ( noMessageWait = 5000 ) => {
    const account = accountsData[ config.comment_account ];
    const { error: redisError, result: queueMessage } = await redisQueue.receiveMessage( {
        client: actionsRsmqClient,
        qname: commentAction.qname
    } );

    if ( redisError || !queueMessage ) {
        console.log( redisError.message || 'Queue is empty' );
        await new Promise( ( resolve ) => setTimeout( resolve, noMessageWait ) );
        return;
    }
    const { error: broadcastError } = await broadcastingSwitcher( queueMessage.message, account, actionTypes.GUEST_POST );

    if ( broadcastError && steemErrRegExp.test( broadcastError.message ) ) {
        config.comment_account === accountsData.length - 1 ? config.comment_account = 0 : config.comment_account += 1;
        return;
    }
    await redisQueue.deleteMessage( { client: actionsRsmqClient, qname: commentAction.qname, id: queueMessage.id } );
    await redisSetter.delActionsData( queueMessage.message );
};


const broadcastingSwitcher = async ( message, account, action ) => {
    const { result: postingData } = await redisGetter.getAllHashData( message );
    let parsedData;

    try{
        parsedData = JSON.parse( postingData );
    }catch( error ) {
        return { error };
    }
    const post = postHelper.getPostData( parsedData, account, action );

    if ( !_.has( parsedData, 'comment_options.extensions' ) ) return await dsteemModel.post( post, account.postingKey );
    const options = postHelper.getOptions( parsedData, account, action );

    return await dsteemModel.postWithOptions( post, options, account.postingKey );
};

module.exports = { postBroadcaster, commentBroadcaster };

