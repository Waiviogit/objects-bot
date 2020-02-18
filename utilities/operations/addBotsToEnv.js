const _ = require('lodash');
const { appModel } = require('models');
const config = require('config');


exports.setEnvData = async () => {
  const { app } = await appModel.findOne({ name: config.app });
  const proxyBots = _.filter(app.service_bots, (bot) => {
    if (_.includes(bot.roles, 'serviceBot')) return bot;
  });
  const serviceBots = _.filter(app.service_bots, (bot) => {
    if (_.includes(bot.roles, 'proxyBot')) return bot;
  });
  return { serviceBots, proxyBots };
};
