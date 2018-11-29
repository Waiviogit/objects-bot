
const dsteem = require('dsteem');

const opts = {};

//connect to production server
opts.addressPrefix = 'STM';
opts.chainId = '0000000000000000000000000000000000000000000000000000000000000000';

//connect to server which is connected to the network/production
const client = new dsteem.Client('https://api.steemit.com');

  const createPost = async (comment, options, key) => {
        console.log('comment:', comment);
        console.log('options:', options);
        // const returnData = await client.broadcast.commentWithOptions(comment, options, key);
        const returnData = await new Promise(resolve => setTimeout(resolve({ id:`badc0a847dbe70e2ec982aad39a10a${Math.random().toString(36).substring(2)}` }), 5000));

        return returnData;
    };
  const votePost = async (payload) => {
        console.log('client.broadcast.upvote:', payload.payload);
        const returnData = await client.broadcast.vote(payload.payload, payload.privateKey);
        return returnData;
    };

module.exports = {
    createPost, votePost
};
