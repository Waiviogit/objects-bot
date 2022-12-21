const BigNumber = require('bignumber.js');
const _ = require('lodash');
const { vote } = require('../hiveApi/hiveOperations');
const { getTokenBalances, getRewardPool } = require('../hiveEngine/tokensContract');
const { MAX_VOTING_POWER } = require('../../constants/hiveEngine');
const { getEnginePowers } = require('../hiveEngine/operations');
const { smembersAsync, get } = require('../redis/redisGetter');
const { WHITE_LIST_KEY, VOTE_COST, IMPORT_REDIS_KEYS } = require('../../constants/importObjects');

const getWeightForVote = async ({ account, votingPower, amount }) => {
  const tokenBalance = await getTokenBalances({ query: { symbol: 'WAIV', account }, method: 'findOne' });
  if (!tokenBalance) return 0;
  const { stake, delegationsIn } = tokenBalance;
  const pool = await getRewardPool({ query: { symbol: 'WAIV' }, method: 'findOne' });
  if (!pool) return 0;
  const { rewardPool, pendingClaims } = pool;
  const rewards = new BigNumber(rewardPool).dividedBy(pendingClaims);
  const finalRshares = new BigNumber(stake).plus(delegationsIn);

  const reverseRshares = new BigNumber(amount).dividedBy(rewards);
  const reversePower = reverseRshares
    .times(MAX_VOTING_POWER)
    .dividedBy(finalRshares);

  const weight = reversePower
    .times(MAX_VOTING_POWER)
    .dividedBy(votingPower)
    .integerValue()
    .toNumber();
  if (weight > MAX_VOTING_POWER) return MAX_VOTING_POWER;
  return weight;
};

const getVoteAmount = async ({ account }) => {
  const whitelist = await smembersAsync({ key: WHITE_LIST_KEY });
  if (_.includes(whitelist, account)) return VOTE_COST.FOR_WHITE_LIST;
  return VOTE_COST.USUAL;
};

const getMinVotingPower = async ({ user }) => {
  const result = await get({
    key: `${IMPORT_REDIS_KEYS.MIN_POWER}:${user}`,
  });
  if (!result) return MAX_VOTING_POWER;
  return parseFloat(result);
};

exports.voteForField = async ({
  voter, author, permlink,
}) => {
  const minVotingPower = await getMinVotingPower({ user: voter });
  const key = process.env.IMPORT_BOT_KEY;

  const powers = await getEnginePowers({ account: voter, symbol: 'WAIV' });
  if (!powers) {
    console.error('\n voteForField !powers');
    return;
  }
  if (powers.votingPower < minVotingPower) {
    console.error('\n voteForField !powers.votingPower < minVotingPower');
    return;
  }
  const amount = await getVoteAmount({ account: voter });
  const weight = await getWeightForVote({
    account: voter, votingPower: powers.votingPower, amount,
  });

  if (!weight) {
    console.error('\n voteForField !weight');
    return;
  }

  await vote({
    voter,
    author,
    permlink,
    weight,
    key,
  });
};

(async () => {
  await this.voteForField({ voter: 'wiv01' });
  console.log();
})();
