const redis = require('redis');
const bluebird = require('bluebird');
const config = require('config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const actionsDataClient = redis.createClient(process.env.REDISCLOUD_URL);
const actionsQueueClient = redis.createClient(process.env.REDISCLOUD_URL);
const redisNotifyClient = redis.createClient(process.env.REDISCLOUD_URL);
const botsClient = redis.createClient(process.env.REDISCLOUD_URL);
const lastBlockClient = redis.createClient(process.env.REDISCLOUD_URL);

actionsDataClient.select(config.redis.actionsData);
actionsQueueClient.select(config.redis.actionsQueue);
redisNotifyClient.select(config.redis.notifications);
botsClient.select(config.redis.serviceBots);
lastBlockClient.select(config.redis.lastBlock);

module.exports = {
  actionsDataClient, actionsQueueClient, redisNotifyClient, botsClient, lastBlockClient,
};
