const BigNumber = require('bignumber.js');
const _ = require('lodash');
const { vote } = require('../hiveApi/hiveOperations');
const { getTokenBalances, getRewardPool } = require('../hiveEngine/tokensContract');
const { MAX_VOTING_POWER } = require('../../constants/hiveEngine');
const { getEnginePowers } = require('../hiveEngine/operations');
const { smembersAsync, get } = require('../redis/redisGetter');
const { WHITE_LIST_KEY, VOTE_COST, IMPORT_REDIS_KEYS } = require('../../constants/importObjects');
const { getPriceWaivUsd } = require('../helpers/tokenPriceHelper');
const { sentryCaptureException } = require('../helpers/sentryHelper');
const { Wobj } = require('../../models');

const isEven = (number) => number % 2 === 0;

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
  const evenWeight = isEven(weight);
  return evenWeight ? weight : weight + 1;
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

const getSameFields = async ({ voter, authorPermlink, fieldType }) => {
  const { result } = await Wobj.findOne({ filter: { author_permlink: authorPermlink } });
  if (!result) return [];
  if (_.isEmpty(result.fields)) return [];
  return _.filter(result.fields, (f) => {
    const activeVote = _.find(
      f.active_votes,
      (v) => v.voter === voter
            && v.percent > 0
            && v.percent % 2 === 0,

    );
    return activeVote && f.name === fieldType;
  });
};

const unvoteOnSameFields = async ({ voter, sameFields }) => {
  for (const field of sameFields) {
    const activeVote = _.find(
      field.active_votes,
      (v) => v.voter === voter,
    );
    if (!activeVote) {
      await sentryCaptureException(new Error(`unvoteOnSameFields !activeVote ${voter}  a: ${field.author} p: ${field.permlink}`));
      continue;
    }

    const weight = activeVote.percent === MAX_VOTING_POWER ? 9999 : activeVote.percent + 1;

    await vote({
      voter,
      author: field.author,
      permlink: field.permlink,
      weight,
      key: process.env.IMPORT_BOT_KEY,
    });
    await new Promise((r) => setTimeout(r, 4000));
  }
};

exports.voteForField = async ({
  voter, author, permlink, authorPermlink, fieldType,
}) => {
  const minVotingPower = await getMinVotingPower({ user: voter });
  const key = process.env.IMPORT_BOT_KEY;

  const powers = await getEnginePowers({ account: voter, symbol: 'WAIV' });
  if (!powers) {
    await sentryCaptureException(new Error(`voteForField !powers ${voter}`));
    return;
  }
  if (powers.votingPower < minVotingPower) {
    await sentryCaptureException(new Error(`voteForField !powers.votingPower < minVotingPower ${voter}`));
    return;
  }
  const amountUsd = await getVoteAmount({ account: voter });

  const { price, error: getPriceWaivUsdError } = await getPriceWaivUsd();

  if (getPriceWaivUsdError) {
    await sentryCaptureException(new Error('voteForField getPriceWaivUsdError'));
    return;
  }

  const amount = amountUsd / price;

  const weight = await getWeightForVote({
    account: voter, votingPower: powers.votingPower, amount,
  });

  if (!weight) {
    await sentryCaptureException(new Error(`voteForField !weight ${voter}`));
    return;
  }

  const sameFields = await getSameFields({ voter, authorPermlink, fieldType });
  if (!_.isEmpty(sameFields)) {
    await unvoteOnSameFields({ voter, sameFields });
  }

  await vote({
    voter,
    author,
    permlink,
    weight,
    key,
  });
};
