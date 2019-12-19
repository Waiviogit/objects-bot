const redisGetter = require( './redisGetter' );
const redisSetter = require( './redisSetter' );
const { actionsRsmqClient, redisQueue } = require( './rsmq' );
const accountsData = require( '../../constants/accountsData' );
const updateMetadata = require( '../helpers/updateMetadata' );
const { uuid } = require( 'uuidv4' );

// Create queue if it not exist, and add "data" to this queue
const addToQueue = async ( data, actionData ) => {
    const { error: createError } = await redisQueue.createQueue( { client: actionsRsmqClient, qname: actionData.qname } );

    if ( createError ) return { error: { status: 500, message: createError } };
    const { result: currentUserComments } = await redisGetter.getHashKeysAll( `${actionData.operation}:${data.commentData.author}:*` );

    if ( currentUserComments.length >= actionData.limit ) {
        return { error: {status: 422, message: `To many comments from ${data.commentData.author} in queue` } };
    }
    data.commentData.json_metadata = updateMetadata.metadataModify( data.commentData.json_metadata );

    const message_id = `${actionData.operation}:${data.commentData.author}:${uuid()}`;

    const { error: sendMessError } = await redisQueue.sendMessage( {
        client: actionsRsmqClient,
        qname: actionData.qname,
        message: message_id
    } );
    const redisDataError = await redisSetter.setActionsData( message_id, JSON.stringify( data ) );

    if ( sendMessError || redisDataError ) {
        return { error: { status: 500, message: sendMessError || redisDataError } };
    }
    const result = { waitingTime: await timeToPosting( actionData ) };

    return { result };
};

// get all items in queue, get count and return time for posting all items
const timeToPosting = async ( actionData ) => {
    const { result: allQueueItems } = await redisGetter.getHashKeysAll( `${actionData.operation}:*` );

    if( actionData.operation === 'proxy-post' ) {
        return ( ( Math.ceil( ( ( allQueueItems.length * actionData.rechargeTime ) / accountsData.guestOperationAccounts.length ) / 5 ) * 5 ) - 5 );
    }
    return Math.round( ( allQueueItems.length * actionData.rechargeTime ) / accountsData.guestOperationAccounts.length );
};

module.exports = { addToQueue };
