const redisGetter = require( './redisGetter' );
const redisSetter = require( './redisSetter' );
const { actionsRsmqClient, redisQueue } = require( './rsmq' );
const accountsData = require( '../../constants/accountsData' );
const updateMetadata = require( '../helpers/updateMetadata' );

const addToQueue = async ( data, actionData ) => {
    const { error: createError } = await redisQueue.createQueue( { client: actionsRsmqClient, qname: actionData.qname } );

    if ( createError ) return { error: { status: 500, message: createError } };
    const { result: currentUserComments } = await redisGetter.getHashKeysAll( `${actionData.operation}:${data.post.author}:*` );

    if ( currentUserComments.length >= actionData.limit ) {
        return { error: { message: `To many comments from ${data.post.author} in queue` } };
    }
    data.post.json_metadata = updateMetadata.metadataModify( data.post.json_metadata );
    const message = `${actionData.operation}:${data.post.author}:${Math.random().toString( 36 ).substring( 2, 15 )}-${Math.random().toString( 36 ).substring( 2, 15 )}`;
    const { error: sendMessError } = await redisQueue.sendMessage( {
        client: actionsRsmqClient,
        qname: actionData.qname,
        message: `${message}`
    } );
    const redisDataError = await redisSetter.setActionsData( message, JSON.stringify( data ) );

    if ( sendMessError || redisDataError ) {
        return { error: { status: 500, message: sendMessError || redisDataError } };
    }
    const result = { waitingTime: await timeToPosting( actionData ) };

    return { result };
};

const timeToPosting = async ( actionData ) => {
    const { result: allQueueLength } = await redisGetter.getHashKeysAll( `${actionData.operation}:*` );

    if( actionData.operation === 'proxy-post' ) {
        return ( Math.ceil( ( ( allQueueLength.length * actionData.rechargeTime ) / accountsData.guestOperationAccounts.length ) / 5 ) * 5 );
    }
    return Math.round( ( allQueueLength.length * actionData.rechargeTime ) / accountsData.guestOperationAccounts.length );
};

module.exports = { addToQueue };
