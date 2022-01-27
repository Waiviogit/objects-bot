const commentAction = {
  qname: 'action_comment', operation: 'proxy-comment', rechargeTime: 0.05, limit: 10,
};
const postAction = {
  qname: 'action_post', operation: 'proxy-post', rechargeTime: 5, limit: 3,
};

const reviewAction = {
  qname: 'review_post', operation: 'proxy-post-review', rechargeTime: 5, limit: 10,
};
const deleteAction = {
  qname: 'delete_post', operation: 'delete-comment', rechargeTime: 5, limit: 10,
};

module.exports = {
  commentAction, postAction, reviewAction, deleteAction,
};
