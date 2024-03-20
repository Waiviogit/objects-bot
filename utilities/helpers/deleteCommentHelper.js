const _ = require('lodash');
const { hiveOperations } = require('utilities/hiveApi');
const { redisHelper } = require('utilities/redis');
const { deleteAction } = require('constants/guestRequestsData');
const { MIN_RC } = require('constants/userData');
const { sendOperations } = require('../hiveApi/hiveOperations');
const { decryptKey } = require('./encryptionHelper');
const addBotsToEnv = require('./serviceBotsHelper');

exports.deleteComment = async (data) => {
  const accounts = await addBotsToEnv.setEnvData();
  if (accounts.error) return { error: accounts.error };
  const rootAcc = _.find(accounts.proxyBots, (acc) => acc.name === data.data.root_author);
  if (!rootAcc) return { error: new Error('key not found') };

  const operation = [['delete_comment', { author: data.data.root_author, permlink: data.data.permlink }]];

  if (await hiveOperations.getAccountRC(data.data.root_author) < MIN_RC) {
    await redisHelper.addToQueue(data, deleteAction);
    return { error: new Error('not enough RC, operation added to the queue') };
  }
  const { result, error: broadcastError } = await sendOperations(
    operation,
    decryptKey(rootAcc.postingKey),
  );

  if (broadcastError) return { error: broadcastError };
  return { result };
};
