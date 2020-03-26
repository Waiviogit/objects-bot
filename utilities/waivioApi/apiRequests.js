const axios = require('axios');
const config = require('config');

exports.getAppData = async ({ name }) => {
  try {
    const result = await axios.get(`https://${config.waivio_auth.host}/api/app/${name}`, { headers: { 'api-key': process.env.API_KEY } });
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
