const { AVAILABLE_TOKEN } = require('constants/transferData');
const { hiveOperations } = require('utilities/hiveApi');
const BigNumber = require('bignumber.js');
const _ = require('lodash');
const config = require('config');
const { getGuestBalance } = require('../waivioApi/apiRequests');
const { getWithdrawLock, setLock, delWithdrawLock } = require('./withdrawLock');

exports.validateBalanceRequest = async ({ account, symbol, quantity }) => {
  const { result, error } = await getGuestBalance({ account, symbol });
  if (error) return false;
  const balance = _.get(result, symbol, '0');

  return BigNumber(quantity).lte(balance);
};

exports.engineBroadcast = async ({ account, operations }) => {
  const { result, error } = await hiveOperations.broadcastJson({
    json: JSON.stringify(operations),
    required_auths: [account.name],
    key: account.key,
  });
  if (error) return { error };

  return { result };
};

exports.transfer = async ({ account, id, data }) => {
  switch (data.symbol) {
    case AVAILABLE_TOKEN.WAIV:
      return hiveEngineTransfer({ account, id, data });
  }
};

const hiveEngineTransfer = async ({ account, id, data }) => {
  const lock = await getWithdrawLock(account);
  if (lock) {
    return { error: { message: 'Operation already in progress', status: 403 } };
  }
  await setLock(account);

  const isValid = await this.validateBalanceRequest(
    { account, symbol: data.symbol, quantity: data.quantity },
  );
  if (!isValid) {
    await delWithdrawLock(account);
    return { error: { status: 422, message: 'balance is not sufficient' } };
  }

  const { result, error } = await this.engineBroadcast({
    account: { name: config.guestHotAccount, key: config.guestHotKey },
    operations: getEngineTransferParams({ ...data, account, id }),
  });
  if (error) {
    await delWithdrawLock(account);
    return { error };
  }

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
