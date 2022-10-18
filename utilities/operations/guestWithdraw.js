/* eslint-disable camelcase */
const { AVAILABLE_TOKEN_WITHDRAW } = require('constants/transferData');
const swapHelper = require('utilities/helpers/swapHelper');
const { marketPools } = require('utilities/hiveEngine');
const BigNumber = require('bignumber.js');
const _ = require('lodash');
const axios = require('axios');
const { validateBalanceRequest, engineBroadcast } = require('./transferOperation');
const { getTokenBalances } = require('../hiveEngine/tokensContract');

const DEFAULT_PRECISION = 8;
const DEFAULT_SLIPPAGE = 0.0001;
const DEFAULT_SLIPPAGE_MAX = 0.01;
const DEFAULT_TRADE_FEE_MUL = 0.9975;
const DEFAULT_WITHDRAW_FEE_MUL = 0.9925;

const getAccountToTransfer = async ({
  destination,
  from_coin,
  to_coin,
}) => {
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

const getWithdrawToAddress = async ({
  address, outputSymbol, amount,
}) => {
  const { error, memo, account } = await getAccountToTransfer({
    destination: address,
    from_coin: AVAILABLE_TOKEN_WITHDRAW[outputSymbol],
    to_coin: outputSymbol,
  });
  if (error) return { error };
  return {
    withdraw: {
      contractName: 'tokens',
      contractAction: 'transfer',
      contractPayload: {
        symbol: AVAILABLE_TOKEN_WITHDRAW[outputSymbol],
        to: account,
        quantity: amount,
        memo,
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
    amount = BigNumber(minAmountOut).toFixed();
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
  },
});

const validateEngineBalance = async ({ account, symbol, quantity }) => {
  const wallet = await getTokenBalances({ query: { account, symbol }, method: 'findOne' });
  if (!wallet) return false;
  return new BigNumber(wallet.balance).gte(quantity);
};

exports.withdraw = async ({ account, data }) => {
  const {
    quantity, inputSymbol, outputSymbol, address,
  } = data;
  const validHotAccBalance = await validateEngineBalance({
    account: process.env.GUEST_HOT_ACC, symbol: inputSymbol, quantity,
  });
  if (!validHotAccBalance) return { error: { message: 'not sufficient balance' } };

  const validGuestBalance = await validateBalanceRequest(
    { account, symbol: inputSymbol, quantity },
  );
  if (!validGuestBalance) return { error: { message: `${account} not sufficient balance` } };

  const params = withdrawParams[inputSymbol][outputSymbol];

  const { swapJson, amount, error } = await params.getSwapData({
    params, quantity, inputSymbol,
  });
  if (error) return { error };

  /// prediction withdraw for front-end
  const predictionAmount = amount * DEFAULT_WITHDRAW_FEE_MUL;

  const { withdraw, error: errWithdrawData } = await params.withdrawContract({
    address, outputSymbol, params, amount, inputSymbol, account, inputQuantity: quantity,
  });

  if (errWithdrawData) return { error: errWithdrawData };
  const customJsonPayload = [...swapJson, withdraw];

  const { result, error: broadcastError } = await engineBroadcast({
    account: { name: process.env.GUEST_HOT_ACC, key: process.env.GUEST_HOT_KEY },
    operations: customJsonPayload,
  });

  if (broadcastError) return { error: broadcastError };
  return { result };
};
