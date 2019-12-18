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
            required_auth: [],
            required_posting_auth: [ account.name ]
        },
        dsteem.PrivateKey.fromString( account.postingKey ) ) };
    } catch( error ) {
        console.error( error );
        return { error };
    }
};

module.exports = { post, postWithOptions, customJSON };
