const _ = require('lodash');
const { hiveOperations } = require('utilities/hiveApi');
const { redisHelper } = require('utilities/redis');
const { deleteAction } = require('constants/guestRequestsData');
const { getAppData } = require('../waivioApi/apiRequests');
const { operations } = require('../hiveApi/hiveOperations');

exports.deleteComment = async (data) => {
  const { app } = await getAppData('waivio');

  const key = _.get(_.filter(app.service_bots, (bot) => {
    if (bot.name === data.data.root_author) return bot;
  }), '[0].postingKey');

  const operation = [['delete_comment', { author: data.data.root_author, permlink: data.data.permlink }]];

  if (await hiveOperations.getAccountRC(data.data.root_author) < 2100000000) {
    await redisHelper.addToQueueDeleteComment(data, deleteAction);
  }
  const { result, error } = await operations(operation, key);
  if (error) return { error };
  return { result };
};
