const config = require('config');
const axios = require('axios');

const getUser = async (name) => {
  try {
    const result = await axios.get(`https://${config.waivio_auth.host}/api/user/${name}`);
    return { user: result.data };
  } catch (error) {
    return { error };
  }
};

module.exports = { getUser };
