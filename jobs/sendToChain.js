const { commentBroadcaster } = require('utilities/operations/broadcastOperations');
const { guestRequestsData } = require('constants/index');

const runPosts = async () => {
  while (true) {
    await commentBroadcaster({
      path: 'guest_post',
      qname: guestRequestsData.postAction.qname,
      noMessageWait: 1000,
      postingErrorWait: 60000,
      botType: 'proxyBots',
    });
  }
};

const runComments = async () => {
  while (true) {
    await commentBroadcaster({
      path: 'guest_comment',
      qname: guestRequestsData.commentAction.qname,
      noMessageWait: 1000,
      postingErrorWait: 10000,
      botType: 'proxyBots',
    });
  }
};

const runReviews = async () => {
  while (true) {
    await commentBroadcaster({
      path: 'guest_review',
      qname: guestRequestsData.reviewAction.qname,
      noMessageWait: 1000,
      postingErrorWait: 60000,
      botType: 'reviewBots',
    });
  }
};
const runDeletePosts = async () => {
  while (true) {
    await commentBroadcaster({
      path: 'delete_comment',
      qname: guestRequestsData.deleteAction.qname,
      noMessageWait: 1000,
      postingErrorWait: 60000,
      botType: 'serviceBots',
    });
  }
};

module.exports = {
  runPosts, runComments, runReviews, runDeletePosts,
};
