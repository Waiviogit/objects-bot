const { AVAILABLE_TOKEN } = require('constants/transferData');
const { hiveOperations } = require('utilities/hiveApi');
const BigNumber = require('bignumber.js');
const _ = require('lodash');
const { getGuestBalance } = require('../waivioApi/apiRequests');

exports.transfer = async ({ account, id, data }) => {
  switch (data.symbol) {
    case AVAILABLE_TOKEN.WAIV:
      return hiveEngineTransfer({ account, id, data });
  }
};

const hiveEngineTransfer = async ({ account, id, data }) => {
  const isValid = validateBalanceRequest(
    { account, symbol: data.symbol, quantity: data.quantity },
  );
  if (!isValid) return { error: { status: 422, message: 'balance is not sufficient' } };

  return engineBroadcast({
    account: { name: process.env.GUEST_HOT_ACC, key: process.env.GUEST_HOT_KEY },
    operations: getEngineTransferParams({ ...data, account, id }),
  });
};

const validateBalanceRequest = async ({ account, symbol, quantity }) => {
  const { result, error } = await getGuestBalance({ account, symbol });
  if (error) return false;
  const balance = _.get(result, symbol, '0');

  return BigNumber(quantity).lte(balance);
};

const engineBroadcast = async ({ account, operations }) => {
  const { result, error } = await hiveOperations.broadcastJson({
    json: JSON.stringify(operations),
    required_auths: [account.name],
    key: account.key,
  });
  if (error) return { error };

  return { result };
};

const getEngineTransferParams = ({
  to, quantity, symbol, memo, account, id,
}) => ({
  contractName: 'tokens',
  contractAction: 'transfer',
  contractPayload: {
    symbol,
    to,
    quantity: String(quantity),
    memo: JSON.stringify({ id, from: account, memo }),
  },
});
