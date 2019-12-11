const redisGetter = require( './redisGetter' );
const redisSetter = require( './redisSetter' );
const { actionsRsmqClient, redisQueue } = require( './rsmq' );
const { accountsData } = require( '../../constants/accountsData' );

const addToQueue = async ( data, actionData ) => {
    const message = `${actionData.operation}:${data.author}:${Math.random().toString( 36 ).substring( 2, 15 )}-${Math.random().toString( 36 ).substring( 2, 15 )}`;
    const { error: sendMessError } = await redisQueue.sendMessage( {
        client: actionsRsmqClient,
        qname: actionData.qname,
        message: `${message}`
    } );

    if ( !sendMessError ) {
        await redisSetter.setActionsData( message, data );
    }
};

const timeToPosting = async ( actionData ) => {
    const allQueueLength = await redisGetter.getHashKeysAll( `${actionData.operation}:*` );

    return Math.round( ( allQueueLength.length * actionData.rechargeTime ) / accountsData.length );
};

module.exports = { addToQueue, timeToPosting };
