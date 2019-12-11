const validators = require( '../validators' );
const { actionsRsmqClient, redisQueue } = require( '../utilities/redis/rsmq' );
const { redisGetter, redisHelper } = require( '../utilities/redis' );
const autoriseUser = require( '../utilities/authorazation/autoriseUser' );

const addPostToQueue = async ( reqBody, action ) => {
    const { error: createError } = await redisQueue.createQueue( { client: actionsRsmqClient, qname: action.qname } );

    if ( createError ) {
        return { error: { status: 500, message: createError } };
    }

    const { error: validateError, params } = validators.validate( reqBody, validators.post.Schema );

    if ( validateError ) {
        return { error: { message: validateError } };
    }
    const { error } = await autoriseUser.authorise( params.author );

    if ( error ) {
        return { error };
    }

    const currentUserComments = await redisGetter.getHashKeysAll( `${action.operation}:${params.author}:*` );

    if ( currentUserComments.length >= action.limit ) {
        return { error: { message: `To many comments from ${params.author} in queue` } };
    }
    await redisHelper.addToQueue( params, action );
    const result = { waitingTime: await redisHelper.timeToPosting( action ) };

    return { result };
};


module.exports = { addPostToQueue };
