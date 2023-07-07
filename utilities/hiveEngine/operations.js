const BigNumber = require('bignumber.js');
const {
  DOWNVOTE_REGENERATION_DAYS,
  MAX_VOTING_POWER,
  VOTE_REGENERATION_DAYS,
  TOKEN_WAIV,
  CACHE_CURRENT_PRICE_KEY,
} = require('../../constants/hiveEngine');
const { getVotingPowers } = require('./tokensContract');
const { getMarketPools } = require('./marketPools');
const { redisGetter } = require('../redis');

const calculateMana = (
  votingPower,
) => {
  const timestamp = new Date().getTime();
  const result = {
    votingPower: votingPower.votingPower,
    downvotingPower: votingPower.downvotingPower,
    lastVoteTimestamp: votingPower.lastVoteTimestamp,
  };

  result.votingPower
        += ((timestamp - result.lastVoteTimestamp) * MAX_VOTING_POWER)
        / (VOTE_REGENERATION_DAYS * 24 * 3600 * 1000);
  result.votingPower = Math.floor(result.votingPower);
  result.votingPower = Math.min(result.votingPower, MAX_VOTING_POWER);

  result.downvotingPower
        += ((timestamp - result.lastVoteTimestamp) * MAX_VOTING_POWER)
        / (DOWNVOTE_REGENERATION_DAYS * 24 * 3600 * 1000);
  result.downvotingPower = Math.floor(result.downvotingPower);
  result.downvotingPower = Math.min(result.downvotingPower, MAX_VOTING_POWER);
  return result;
};

exports.getEnginePowers = async ({ account }) => {
  const powers = await getVotingPowers({ query: { account, rewardPoolId: 13 }, method: 'findOne' });
  return calculateMana(powers);
};

exports.usdToWaiv = async ({ amountUsd }) => {
  const hiveCurrency = await redisGetter.getHashAll(CACHE_CURRENT_PRICE_KEY);
  const [pool] = await getMarketPools({ query: { _id: TOKEN_WAIV.MARKET_POOL_ID } });

  const hiveAmount = BigNumber(amountUsd).div(hiveCurrency.price);
  const waivAmount = hiveAmount.times(pool.basePrice);

  return waivAmount.dp(TOKEN_WAIV.DP).toNumber();
};
