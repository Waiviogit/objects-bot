const { commentBroadcaster } = require('utilities/operations/broadcastOperations');
const { guestRequestsData } = require('constants/index');

const runPosts = async () => {
  while (true) {
    await commentBroadcaster({
      path: 'guest_post',
      qname: guestRequestsData.postAction.qname,
      noMessageWait: 6000,
      postingErrorWait: 60000,
    });
  }
};

const runComments = async () => {
  while (true) {
    await commentBroadcaster({
      path: 'guest_comment',
      qname: guestRequestsData.commentAction.qname,
      noMessageWait: 10000,
      postingErrorWait: 10000,
    });
  }
};

module.exports = { runPosts, runComments };
