const _ = require('lodash');
const config = require('config');
const apiRequests = require('utilities/waivioApi/apiRequests');
const redisGetter = require('utilities/redis/redisGetter');
const jsonHelper = require('utilities/helpers/jsonHelper');
const { CACHE_SERVICE_BOTS } = require('constants/redisBlockNames');

exports.setEnvData = async () => {
  const { bots, error } = await getCacheBots();
  if (error) return { error };
  const serviceBots = _.filter(bots, (bot) => {
    if (_.includes(bot.roles, 'serviceBot')) return bot;
  });
  const proxyBots = _.filter(bots, (bot) => {
    if (_.includes(bot.roles, 'proxyBot')) return bot;
  });
  const reviewBots = _.filter(bots, (bot) => {
    if (_.includes(bot.roles, 'reviewBot')) return bot;
  });
  return { serviceBots, proxyBots, reviewBots };
};

const getCacheBots = async () => {
  const bots = await redisGetter.smembersAsync({ key: CACHE_SERVICE_BOTS });
  if (_.isEmpty(bots)) {
    const { app, error } = await apiRequests.getAppData({ name: config.app });
    if (error) return { error };
    if (!app) return { error: { message: 'App not found!' } };
    return { bots: app.service_bots };
  }
  const parsedBots = _.compact(_.map(bots, (el) => jsonHelper.parseJson(el, null)));
  return { bots: parsedBots };
};
