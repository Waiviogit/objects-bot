const { DOWNVOTE_REGENERATION_DAYS, MAX_VOTING_POWER, VOTE_REGENERATION_DAYS } = require('../../constants/hiveEngine');
const { getVotingPowers } = require('./tokensContract');

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
