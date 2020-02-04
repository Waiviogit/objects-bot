const redis = require('redis');
const bluebird = require('bluebird');
const config = require('config');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
const actionsDataClient = redis.createClient(process.env.REDISCLOUD_URL);
const actionsQueueClient = redis.createClient(process.env.REDISCLOUD_URL);

actionsDataClient.select(config.redis.actionsData);
actionsQueueClient.select(config.redis.actionsQueue);

module.exports = { actionsDataClient, actionsQueueClient };
