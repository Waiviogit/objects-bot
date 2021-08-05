const _ = require('lodash');
const updateMetadata = require('utilities/helpers/updateMetadata');
const { hiveOperations } = require('utilities/hiveApi');

exports.validateComment = async (comment, next) => {
  const metadata = updateMetadata.parseMetadata(comment.json_metadata, next);
  if (_.get(metadata, 'comment.userId') !== comment.author) {
    return next({ error: { message: 'Comment not found!', status: 404 } });
  }
  const { error } = await hiveOperations.getComment({
    author: comment.guest_root_author, permlink: comment.permlink,
  });

  if (error) return next({ error });

  return true;
};
