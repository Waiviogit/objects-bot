const _ = require('lodash');
const config = require('config');
const apiRequests = require('utilities/waivioApi/apiRequests');

const checkForBlackList = async (creator) => {
  const { app, error } = await apiRequests.getAppData({ name: config.app });
  if (error) return false;
  return _.includes(app.black_list_users, creator);
};

module.exports = { checkForBlackList };
