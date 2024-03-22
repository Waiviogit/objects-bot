const axios = require('axios');
const config = require('config');
const _ = require('lodash');

exports.getAppData = async ({ name }) => {
  try {
    const result = await axios.get(`https://${config.waivio_auth.host}/api/app/${name}`);
    return { app: result.data };
  } catch (error) {
    return { error };
  }
};

exports.getPost = async ({ author, permlink }) => {
  try {
    const result = await axios.get(`https://${config.waivio_auth.host}/api/post/${author}/${permlink}`);
    return { post: result.data };
  } catch (error) {
    return { error };
  }
};

exports.getGuestBalance = async ({ account, symbol }) => {
  try {
    const result = await axios.get(
      `https://${config.waivio_auth.host}/api/user/${account}/guest-balance`,
      { params: { symbol } },
    );
    return { result: result.data };
  } catch (error) {
    return { error };
  }
};

exports.getWeightToReject = async ({
  userName, author, permlink, authorPermlink,
}) => {
  try {
    const result = await axios.post(
      `https://${config.waivio_auth.host}/api/users/min-reject`,

      {
        userName, author, permlink, authorPermlink,
      },
      {
        timeout: 5000,
      },
    );
    return _.get(result, 'data.result', 9999);
  } catch (error) {
    return 9999;
  }
};
