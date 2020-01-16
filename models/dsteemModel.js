const dsteem = require( 'dsteem' );
const client = new dsteem.Client( 'https://api.steemit.com' );

const post = async ( data, key ) => {
    try{
        return{ result: await client.broadcast.comment( data, dsteem.PrivateKey.fromString( key ) ) };
    } catch( error ) {
        console.error( error );
        return { error };
    }
};

const postWithOptions = async ( comment, options, key ) => {
    try{
        return{ result: await client.broadcast.commentWithOptions( comment, options, dsteem.PrivateKey.fromString( key ) ) };
    } catch( error ) {
        console.error( error );
        return { error };
    }
};

const customJSON = async ( data, account ) => {

    try{
        return{ result: await client.broadcast.json( {
            id: data.id,
            json: data.json,
            required_auths: [ ],
            required_posting_auths: [ account.name ]
        },
        dsteem.PrivateKey.fromString( account.postingKey ) ) };
    } catch( error ) {
        console.error( error );
        return { error };
    }
};

const getComment = async ( author, permlink ) => {
    const userComment = await client.database.call( 'get_content', [ author, permlink ] );

    if ( userComment.author ) {
        return { userComment };
    }
    return { error: { message: 'Comment not found!', status: 404 } };
};

module.exports = { post, postWithOptions, customJSON, getComment };
