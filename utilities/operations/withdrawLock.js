const { redisGetter, redis, redisSetter } = require('../redis');

const WITHDRAW_LOCK_KEY = 'guest_withdraw_lock:';

const getWithdrawLock = async (account) => {
  const result = await redisGetter.get({
    key: `${WITHDRAW_LOCK_KEY}${account}`,
    client: redis.botsClient,
  });

  return result;
};
const setLock = async (account) => {
  await redisSetter.setEx({
    key: `${WITHDRAW_LOCK_KEY}${account}`,
    client: redis.botsClient,
    value: account,
    ttl: 60 * 60 * 24,
  });
};
const delWithdrawLock = async (account) => {
  await redisSetter.del({
    key: `${WITHDRAW_LOCK_KEY}${account}`,
    client: redis.botsClient,
  });
};

module.exports = {
  getWithdrawLock,
  setLock,
  delWithdrawLock,
};
