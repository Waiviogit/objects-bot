const _ = require('lodash');
const { redisGetter } = require('utilities/redis');
const { regExp } = require('constants/index');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const apiRequests = require('utilities/waivioApi/apiRequests');
const { hiveOperations } = require('utilities/hiveApi');
const { decryptKey } = require('./encryptionHelper');
const jsonHelper = require('./jsonHelper');
const { signComment } = require('./signatureHelper');

const commentFinder = async (author, permlink) => {
  const { post } = await apiRequests.getPost({ author, permlink });
  if (post) {
    return { author: post.root_author };
  }
};

const addSignatureToJsonMetadata = ({ jsonMetadata, author, permlink }) => {
  const json = jsonHelper.parseJson(jsonMetadata, {});
  json.signature = signComment({ author, permlink });

  return JSON.stringify(json);
};

const switcher = async (message, account) => {
  const { result: postingData } = await redisGetter.getAllHashData(message);
  if (!postingData) return { error: { message: 'No data from redis' } };
  const parsedData = jsonHelper.parseJson(postingData);

  parsedData.comment.json_metadata = addSignatureToJsonMetadata({
    jsonMetadata: parsedData?.comment?.json_metadata,
    author: account.name,
    permlink: parsedData?.comment?.permlink,
  });

  // check post to exists in base, if exist -> it is update
  if (!parsedData.comment.parent_author) {
    const checkInBase = await commentFinder(parsedData.comment.author, parsedData.comment.permlink);
    // if author exists - we need to update post
    if (_.has(checkInBase, 'author')) {
      parsedData.comment.json_metadata = addSignatureToJsonMetadata({
        jsonMetadata: parsedData?.comment?.json_metadata,
        author: checkInBase.author,
        permlink: parsedData?.comment?.permlink,
      });
      return updateHelper(checkInBase.author, parsedData.comment);
    }
  }
  // if in post data from redis exists special flag - it is comment for update
  if (parsedData.comment.parent_author && parsedData.comment.guest_root_author) {
    return updateHelper(parsedData.comment.guest_root_author, _.omit(parsedData.comment, ['guest_root_author']));
  }

  const post = parsedData.comment;
  const guestAuthor = _.cloneDeep(post.author);
  console.info(`Try to create comment by | ${account.name} | guest author ${guestAuthor}`);
  // Prepare comment body
  const host = jsonHelper.parseJson(post?.json_metadata, null)?.host;
  const hostRef = host ? `https://${host}` : '';

  post.body = `${post.body}
---

[Posted](${hostRef}/${await permlinkGenerator(post, account, guestAuthor)}) by Waivio guest: [@${post.author}](${hostRef}/@${post.author})`;
  // Change comment author for bot name
  post.author = account.name;

  if (post.post_root_author) post.parent_author = post.post_root_author;
  // If data has no field options - return result of simply post method of dsteem
  if (!_.has(parsedData, 'options')) return simplyPostHelper(post, decryptKey(account.postingKey), guestAuthor);
  // else return result of post method with options(beneficiaries)
  const { options } = parsedData;
  options.author = account.name;
  if (!options.percent_hbd) options.percent_hbd = 0;
  const { result, error } = await hiveOperations
    .postWithOptions({ comment: post, options: parsedData.options, key: decryptKey(account.postingKey) });
  if (error && error.message.match('beneficiaries')) return simplyPostHelper(post, decryptKey(account.postingKey), guestAuthor);
  return { result, error, guestAuthor };
};

const simplyPostHelper = async (post, key, guestAuthor) => {
  const { result, error } = await hiveOperations.post({ data: post, key });
  return { result, error, guestAuthor };
};

const updateHelper = async (author, comment) => {
  const accounts = await addBotsToEnv.setEnvData();
  if (accounts.error) return { error: accounts.error };
  let rootAcc = _.find(accounts.proxyBots, (acc) => acc.name === author);
  if (!rootAcc) rootAcc = _.find(accounts.reviewBots, (acc) => acc.name === author);
  comment.author = rootAcc.name;
  if (comment.post_root_author) comment.parent_author = comment.post_root_author;
  const { result: updateResult, error: updateError } = await hiveOperations.post({
    data: comment, key: decryptKey(rootAcc.postingKey),
  });
  if (updateResult) return { result: updateResult };
  // if dsteem method returns special error - message neednt to be deleted
  if (regExp.steemErrRegExp.test(updateError.message)) return { error: { message: 'update error' } };
  return { error: updateError };
};

//
// const permlinkGenerator = (post, account) => (post.parent_author
//     ? `@${post.parent_author}/${post.parent_permlink}#@${account.name}/${post.permlink}`
//     : `@${account.name}/${post.permlink}`);

const permlinkGenerator = async (post, account, guest) => {
  let metadata;
  if (post.parent_author) {
    try {
      const { userComment: steemPost } = await hiveOperations.getComment({
        author: post.parent_author, permlink: post.parent_permlink,
      });
      metadata = JSON.parse(steemPost.json_metadata);
    } catch (e) {}
  }
  return post.parent_author
    ? `@${_.get(metadata, 'comment.userId', post.parent_author)}/${post.parent_permlink}#@${guest}/${post.permlink}`
    : `@${guest}/${post.permlink}`;
};

module.exports = { switcher };
