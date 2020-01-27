
const dsteem = require( 'dsteem' );

const opts = {};

// connect to production server
opts.addressPrefix = 'STM';
opts.chainId = '0000000000000000000000000000000000000000000000000000000000000000';

// connect to server which is connected to the network/production
const client = new dsteem.Client( 'https://api.steemit.com' );

const createPost = async ( comment, options, key ) => await client.broadcast.commentWithOptions( comment, options, key );

// const votePost = async (payload) => await client.broadcast.vote(payload.payload, payload.privateKey);

// const broadcastOperations = async (operations, key) => await client.broadcast.sendOperations(operations, key);

module.exports = {
    createPost
};
