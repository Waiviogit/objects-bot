const dsteem = require( 'dsteem' );
const client = new dsteem.Client( 'https://api.steemit.com' );

const post = async ( data, key ) => {
    try{
        return{ result: await client.broadcast.comment( data, dsteem.PrivateKey.fromString( key ) ) };
    } catch( error ) {
        console.log( error );
        return { error };
    }
};

const postWithOptions = async ( comment, options, key ) => {
    try{
        return{ result: await client.broadcast.commentWithOptions( comment, options, dsteem.PrivateKey.fromString( key ) ) };
    } catch( error ) {
        console.log( error );
        return { error };
    }
};

const customJSON = async ( data ) => {

    try{
        return{ result: await client.broadcast.json( data.json, dsteem.PrivateKey.fromString( data.postingKey ) ) };
    } catch( error ) {
        console.log( error );
        return { error };
    }
};

module.exports = { post, postWithOptions, customJSON };
