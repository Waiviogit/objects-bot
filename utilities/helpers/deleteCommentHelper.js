const _ = require('lodash');
const { hiveOperations } = require('utilities/hiveApi');
const { redisHelper } = require('utilities/redis');
const { deleteAction } = require('constants/guestRequestsData');
const { MIN_RC } = require('constants/userData');
const config = require('config');
const { getAppData } = require('../waivioApi/apiRequests');
const { sendOperations } = require('../hiveApi/hiveOperations');

exports.deleteComment = async (data) => {
  const { app, error } = await getAppData({ name: config.app });
  if (error) return { error };

  const key = _.get(_.filter(app.service_bots, (bot) => {
    if (bot.name === data.data.root_author) return bot;
  }), '[0].postingKey');

  const operation = [['delete_comment', { author: data.data.root_author, permlink: data.data.permlink }]];

  if (await hiveOperations.getAccountRC(data.data.root_author) < MIN_RC) {
    await redisHelper.addToQueue(data, deleteAction);
    return { error: new Error('not enough RC, operation added to the queue') };
  }
  const { result, error: broadcastError } = await sendOperations(operation, key);
  if (broadcastError) return { error: broadcastError };
  return { result };
};
