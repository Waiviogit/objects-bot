const marketPools = require('utilities/hiveEngine/marketPools');
const { TOKEN_WAIV, CACHE_MARKET_POOL_KEY } = require('constants/hiveEngine');
const _ = require('lodash');
const { redisGetter } = require('utilities/redis');
const { CACHE_KEY_COINGECKO } = require('constants/currencyData');
const axios = require('axios');
const BigNumber = require('bignumber.js');

exports.getPriceWaivUsd = async () => {
  const pool = await this.getWaivPool();
  const { quotePrice } = pool;
  const priceWaivInHive = parseFloat(quotePrice);
  const { usdCurrency, error } = await this.getPriceHiveUsd();
  if (error) return { error };
  return { price: BigNumber(priceWaivInHive).times(usdCurrency).dp(3).toNumber() };
};

exports.getWaivPool = async () => {
  const marketPool = await marketPools
    .getMarketPools({ query: { _id: TOKEN_WAIV.MARKET_POOL_ID } });
  if (!_.isEmpty(marketPool)) return marketPool[0];
  return redisGetter.getHashAll(`${CACHE_MARKET_POOL_KEY}:${TOKEN_WAIV.SYMBOL}`);
};

exports.getPriceHiveUsd = async () => {
  const cache = await redisGetter.getHashAll(CACHE_KEY_COINGECKO);
  if (cache) {
    return { usdCurrency: Number(cache.hive) };
  }

  try {
    const result = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd');
    const usdCurrency = result.data.hive.usd;
    return { usdCurrency };
  } catch (error) {
    return { error };
  }
};

