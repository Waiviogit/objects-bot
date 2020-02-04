const { redisHelper } = require('utilities/redis');
const { commentAction, postAction } = require('constants/guestRequestsData');

const queueSwitcher = async (data) => redisHelper.addToQueue(data,
  data.comment.parent_author ? commentAction : postAction);


module.exports = { queueSwitcher };
