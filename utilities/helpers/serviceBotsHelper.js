const _ = require('lodash');
const config = require('config');
const apiRequests = require('utilities/waivioApi/apiRequests');


exports.setEnvData = async () => {
  const { app } = await apiRequests.getAppData({ name: config.app });
  const serviceBots = _.filter(app.service_bots, (bot) => {
    if (_.includes(bot.roles, 'serviceBot')) return bot;
  });
  const proxyBots = _.filter(app.service_bots, (bot) => {
    if (_.includes(bot.roles, 'proxyBot')) return bot;
  });
  return { serviceBots, proxyBots };
};
