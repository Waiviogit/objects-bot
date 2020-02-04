const PostSchema = require('database').models.Post;

const findOne = async (data) => {
  try {
    const post = await PostSchema.findOne({ author: data.author, permlink: data.permlink });
    return { post };
  } catch (error) {
    return { error };
  }
};

module.exports = { findOne };
