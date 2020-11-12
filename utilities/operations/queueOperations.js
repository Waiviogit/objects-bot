const { redisHelper } = require('utilities/redis');
const { commentAction, postAction, reviewAction } = require('constants/guestRequestsData');

const queueSwitcher = async (data) => {
  let actionData;
  if (data.comment.parent_author) actionData = commentAction;
  if (!data.comment.parent_author) actionData = postAction;
  if (data.isReview) actionData = reviewAction;
  return redisHelper.addToQueue(data, actionData);
};


module.exports = { queueSwitcher };
