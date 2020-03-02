const _ = require('lodash');
const { appModel } = require('models');
const config = require('config');


const checkForBlackList = async (creator) => {
  const { app, error } = await appModel.findOne({ name: config.app });
  if (error) return true;
  return _.includes(app.black_list_users, creator);
};

module.exports = { checkForBlackList };
