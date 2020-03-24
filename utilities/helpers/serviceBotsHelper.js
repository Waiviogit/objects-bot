const _ = require('lodash');
const config = require('config');
const apiRequests = require('utilities/waivioApi/apiRequests');


exports.setEnvData = async () => {
  const { app, error } = await apiRequests.getAppData({ name: config.app });
  if (error) return { error };
  if (!app) return { error: { message: 'App not found!' } };
  const serviceBots = _.filter(app.service_bots, (bot) => {
    if (_.includes(bot.roles, 'serviceBot')) return bot;
  });
  const proxyBots = _.filter(app.service_bots, (bot) => {
    if (_.includes(bot.roles, 'proxyBot')) return bot;
  });
  return { serviceBots, proxyBots };
};
