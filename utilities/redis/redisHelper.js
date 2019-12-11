const redisGetter = require( './redisGetter' );
const redisSetter = require( './redisSetter' );
const { actionsRsmqClient, redisQueue } = require( './rsmq' );
const { accountsData } = require( '../../constants/accountsData' );
const { metadataModify } = require( '../operations/metadataOperations' );

const addToQueue = async ( data, actionData ) => {
    const { error: createError } = await redisQueue.createQueue( { client: actionsRsmqClient, qname: actionData.qname } );

    if ( createError ) return { error: { status: 500, message: createError } };
    const currentUserComments = await redisGetter.getHashKeysAll( `${actionData.operation}:${data.author}:*` );

    if ( currentUserComments.length >= actionData.limit ) {
        return { error: { message: `To many comments from ${data.author} in queue` } };
    }
    data.json_metadata = metadataModify( data.json_metadata );
    const message = `${actionData.operation}:${data.author}:${Math.random().toString( 36 ).substring( 2, 15 )}-${Math.random().toString( 36 ).substring( 2, 15 )}`;
    const { error: sendMessError } = await redisQueue.sendMessage( {
        client: actionsRsmqClient,
        qname: actionData.qname,
        message: `${message}`
    } );
    const redisDataError = await redisSetter.setActionsData( message, data );

    if ( sendMessError || redisDataError ) {
        return { error: { status: 500, message: sendMessError || redisDataError } };
    }
    const result = { waitingTime: await timeToPosting( actionData ) };

    return { result };
};

const timeToPosting = async ( actionData ) => {
    const allQueueLength = await redisGetter.getHashKeysAll( `${actionData.operation}:*` );

    if( actionData.operation === 'proxy-post' ) {
        return ( Math.ceil( ( ( allQueueLength.length * actionData.rechargeTime ) / accountsData.length ) / 5 ) * 5 );
    }
    return Math.round( ( allQueueLength.length * actionData.rechargeTime ) / accountsData.length );
};

module.exports = { addToQueue };
