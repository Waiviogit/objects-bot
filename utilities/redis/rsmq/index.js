const RedisSMQ = require('rsmq');
const config = require('config');

const actionsRsmqClient = new RedisSMQ({ ns: 'rsmq', options: { db: config.redis.actionsQueue } });

module.exports = {
  actionsRsmqClient,
  redisQueue: require('./redisQueue'),
};
