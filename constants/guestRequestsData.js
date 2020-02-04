const commentAction = {
  qname: 'action_comment', operation: 'proxy-comment', rechargeTime: 0.05, limit: 10,
};
const postAction = {
  qname: 'action_post', operation: 'proxy-post', rechargeTime: 5, limit: 3,
};

module.exports = { commentAction, postAction };
