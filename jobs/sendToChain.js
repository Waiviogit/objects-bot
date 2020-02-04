const { postBroadcaster, commentBroadcaster } = require('utilities/operations/broadcastOperations');

const runPosts = async () => {
  while (true) {
    await postBroadcaster();
  }
};

const runComments = async () => {
  while (true) {
    await commentBroadcaster();
  }
};

module.exports = { runPosts, runComments };
