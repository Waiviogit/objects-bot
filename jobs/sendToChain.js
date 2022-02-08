const { commentBroadcaster, deletePostBroadcast, broadcastStatusParse } = require('utilities/operations/broadcastOperations');
const { guestRequestsData } = require('constants/index');

const runPosts = async () => {
  while (true) {
    await commentBroadcaster({
      path: 'guest_post',
      qname: guestRequestsData.postAction.qname,
      noMessageWait: 1000,
      postingErrorWait: 60000,
      botType: 'proxyBots',
      callBack: broadcastStatusParse,
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
      callBack: broadcastStatusParse,
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
      callBack: broadcastStatusParse,
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
      callBack: deletePostBroadcast,
    });
  }
};

module.exports = {
  runPosts, runComments, runReviews, runDeletePosts,
};
