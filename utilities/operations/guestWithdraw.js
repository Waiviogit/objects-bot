/* eslint-disable camelcase */
const { AVAILABLE_TOKEN_WITHDRAW } = require('constants/transferData');
const swapHelper = require('utilities/helpers/swapHelper');
const { marketPools } = require('utilities/hiveEngine');
const BigNumber = require('bignumber.js');
const _ = require('lodash');
const axios = require('axios');
const Web3 = require('web3');
const config = require('config');
const { validateBalanceRequest, engineBroadcast } = require('./transferOperation');
const { getTokenBalances } = require('../hiveEngine/tokensContract');
const { getWithdrawLock, setLock, delWithdrawLock } = require('./withdrawLock');

const DEFAULT_PRECISION = 8;
const DEFAULT_SLIPPAGE = 0.0001;
const DEFAULT_SLIPPAGE_MAX = 0.01;
const DEFAULT_TRADE_FEE_MUL = 0.9975;
const DEFAULT_WITHDRAW_FEE_MUL = 0.9925;

const getETHAccountToTransfer = ({
  destination,
}) => {
  const validAddress = Web3.utils.isAddress(destination);
  if (!validAddress) return { error: new Error('invalid ETH address') };
  return {
    account: 'swap-eth',
    memo: destination,
  };
};

const getAccountToTransfer = async ({
  destination,
  from_coin,
  to_coin,
}) => {
  if (to_coin === 'ETH') {
    return getETHAccountToTransfer({ destination });
  }
  try {
    const result = await axios.post(
      'https://converter-api.hive-engine.com/api/convert/',
      {
        destination,
        from_coin,
        to_coin,
      },
    );
    if (result && result.data) return result.data;
    return result;
  } catch (error) {
    return { error };
  }
};

const validateEthAmount = async (amount) => {
  try {
    const resp = await axios.get('https://ethgw.hive-engine.com/api/utils/withdrawalfee/SWAP.ETH');
    const fee = _.get(resp, 'data.data');
    if (!fee) return false;
    return BigNumber(amount).minus(fee).times(DEFAULT_WITHDRAW_FEE_MUL).gt(0);
  } catch (error) {
    return false;
  }
};

const validateBtcAmount = async (amount) => {
  try {
    const resp = await axios.get('https://api.tribaldex.com/settings');
    const minimum_withdrawals = _.get(resp, 'data.minimum_withdrawals');
    if (!minimum_withdrawals) return false;
    const fee = _.find(minimum_withdrawals, (el) => el[0] === 'SWAP.BTC')[1];
    if (!fee) return false;
    return BigNumber(amount).minus(fee).gte(0);
  } catch (error) {
    return false;
  }
};

const validateAmount = async ({ amount, outputSymbol }) => {
  const validation = {
    HIVE: (el) => BigNumber(el).gte(0.002),
    ETH: validateEthAmount,
    BTC: validateBtcAmount,
    LTC: () => true,
  };
  return validation[outputSymbol](amount);
};

const getWithdrawToAddress = async ({
  address, outputSymbol, amount, inputSymbol, inputQuantity, account,
}) => {
  const { error, memo, account: to } = await getAccountToTransfer({
    destination: address,
    from_coin: AVAILABLE_TOKEN_WITHDRAW[outputSymbol],
    to_coin: outputSymbol,
  });
  if (error) return { error };

  const validAmount = await validateAmount({ amount, outputSymbol });
  if (!validAmount) return { error: new Error(`to low amount: ${amount} for ${outputSymbol} on output to withdraw`) };
  return {
    withdraw: {
      contractName: 'tokens',
      contractAction: 'transfer',
      contractPayload: {
        symbol: AVAILABLE_TOKEN_WITHDRAW[outputSymbol],
        to,
        quantity: amount,
        memo,
        // front-end: remove properties below
        inputSymbol,
        inputQuantity,
        account,
        address,
      },
    },
  };
};

const getWithdrawContract = ({
  amount, address, inputSymbol, account, inputQuantity,
}) => ({
  withdraw: {
    contractName: 'hivepegged',
    contractAction: 'withdraw',
    contractPayload: {
      inputSymbol,
      inputQuantity,
      address,
      account,
      quantity: new BigNumber(amount).toFixed(3), // front-end use only this param!
    },
  },
});

const directPoolSwapData = async ({
  quantity, inputSymbol, params,
}) => {
  const { tokenPair } = params;
  const [pool] = await marketPools.getMarketPools({ query: { tokenPair } });
  if (!pool) return { error: new Error('market pool is unavailable') };
  const { json, minAmountOut } = swapHelper.getSwapOutput({
    symbol: inputSymbol,
    amountIn: quantity,
    pool,
    precision: DEFAULT_PRECISION,
    slippage: DEFAULT_SLIPPAGE,
    tradeFeeMul: DEFAULT_TRADE_FEE_MUL,
  });
  return { swapJson: [json], amount: BigNumber(minAmountOut).toFixed() };
};

const indirectSwapData = async ({
  quantity, params,
}) => {
  const { tokenPair, exchangeSequence } = params;
  const swapJson = [];
  let amount = '0';
  const pools = await marketPools.getMarketPools({ query: { tokenPair: { $in: tokenPair } } });
  if (_.isEmpty(pools)) return { error: new Error('market pool is unavailable') };
  for (const [index, pair] of tokenPair.entries()) {
    const pool = pools.find((p) => p.tokenPair === pair);
    if (!pool) return { error: new Error('market pool is unavailable') };
    const { json, minAmountOut } = swapHelper.getSwapOutput({
      symbol: exchangeSequence[index],
      amountIn: index ? amount : quantity,
      pool,
      precision: DEFAULT_PRECISION,
      slippage: index ? DEFAULT_SLIPPAGE_MAX : DEFAULT_SLIPPAGE,
      tradeFeeMul: DEFAULT_TRADE_FEE_MUL,
    });
    swapJson.push(json);
    amount = BigNumber(minAmountOut).toFixed(DEFAULT_PRECISION);
  }

  return { swapJson, amount };
};

const withdrawParams = Object.freeze({
  WAIV: {
    HIVE: {
      getSwapData: directPoolSwapData,
      withdrawContract: getWithdrawContract,
      tokenPair: 'SWAP.HIVE:WAIV',
    },
    BTC: {
      getSwapData: indirectSwapData,
      withdrawContract: getWithdrawToAddress,
      tokenPair: ['SWAP.HIVE:WAIV', 'SWAP.HIVE:SWAP.BTC'],
      exchangeSequence: ['WAIV', 'SWAP.HIVE'],
    },
    LTC: {
      getSwapData: indirectSwapData,
      withdrawContract: getWithdrawToAddress,
      tokenPair: ['SWAP.HIVE:WAIV', 'SWAP.HIVE:SWAP.LTC'],
      exchangeSequence: ['WAIV', 'SWAP.HIVE'],
    },
    ETH: {
      getSwapData: indirectSwapData,
      withdrawContract: getWithdrawToAddress,
      tokenPair: ['SWAP.HIVE:WAIV', 'SWAP.HIVE:SWAP.ETH'],
      exchangeSequence: ['WAIV', 'SWAP.HIVE'],
    },
  },
});

const validateEngineBalance = async ({ account, symbol, quantity }) => {
  const wallet = await getTokenBalances({ query: { account, symbol }, method: 'findOne' });
  if (!wallet) return false;
  return new BigNumber(wallet.balance).gte(quantity);
};

exports.withdraw = async ({ account, data }) => {
  const lock = await getWithdrawLock(account);
  if (lock) {
    return { error: { message: 'Operation already in progress', status: 403 } };
  }
  await setLock(account);

  const {
    quantity, inputSymbol, outputSymbol, address,
  } = data;
  const validHotAccBalance = await validateEngineBalance({
    account: config.guestHotAccount, symbol: inputSymbol, quantity,
  });
  if (!validHotAccBalance) {
    await delWithdrawLock(account);
    return { error: { message: 'not sufficient balance' } };
  }

  const validGuestBalance = await validateBalanceRequest(
    { account, symbol: inputSymbol, quantity },
  );
  if (!validGuestBalance) {
    await delWithdrawLock(account);
    return { error: { message: `${account} not sufficient balance` } };
  }

  const params = withdrawParams[inputSymbol][outputSymbol];

  const { swapJson, amount, error } = await params.getSwapData({
    params, quantity, inputSymbol,
  });
  if (error) {
    await delWithdrawLock(account);
    return { error };
  }

  /// prediction withdraw for front-end
  const predictionAmount = amount * DEFAULT_WITHDRAW_FEE_MUL;

  const { withdraw, error: errWithdrawData } = await params.withdrawContract({
    address, outputSymbol, params, amount, inputSymbol, account, inputQuantity: quantity,
  });

  if (errWithdrawData) {
    await delWithdrawLock(account);
    return { error: errWithdrawData };
  }
  const customJsonPayload = [...swapJson, withdraw];
  const { result, error: broadcastError } = await engineBroadcast({
    account: { name: config.guestHotAccount, key: config.guestHotKey },
    operations: customJsonPayload,
  });

  if (broadcastError) {
    await delWithdrawLock(account);
    return { error: broadcastError };
  }
  return { result };
};
