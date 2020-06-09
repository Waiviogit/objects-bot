const _ = require('lodash');
const { dsteemModel } = require('models');
const { redisGetter } = require('utilities/redis');
const { regExp } = require('constants/index');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const apiRequests = require('utilities/waivioApi/apiRequests');

const commentFinder = async (author, permlink) => {
  const { post } = await apiRequests.getPost({ author, permlink });
  if (post) {
    return { author: post.root_author };
  }
};

const switcher = async (message, account) => {
  const { result: postingData } = await redisGetter.getAllHashData(message);
  let parsedData, parsedMetadata;
  if (!postingData) return { error: { message: 'No data from redis' } };
  try {
    parsedData = JSON.parse(postingData);
    // check post to exists in base, if exist -> it is update
    if (!parsedData.comment.parent_author) {
      const checkInBase = await commentFinder(
        parsedData.comment.author, parsedData.comment.permlink,
      );
      // if author exists - we need to update post
      if (_.has(checkInBase, 'author')) return await updateHelper(checkInBase.author, parsedData.comment);
    }
    // if in post data from redis exists special flag - it is comment for update
    if (parsedData.comment.parent_author && parsedData.comment.guest_root_author) {
      return await updateHelper(parsedData.comment.guest_root_author, _.omit(parsedData.comment, ['guest_root_author']));
    }
    parsedMetadata = JSON.parse(parsedData.comment.json_metadata);
  } catch (e) {
    return { error: e };
  }
  const post = parsedData.comment;
  console.info(`Try to create comment by | ${account.name}`);
  const app = chooseApp(parsedMetadata.app);
  // Prepare comment body
  post.body = `${post.body}\n <hr/>\n\n <center>[Posted](https://${app}/${permlinkGenerator(post, account)}) by Waivio guest: [@${post.author}](https://${app}/@${post.author})</center>`;
  // Change comment author for bot name
  post.author = account.name;

  if (post.post_root_author) post.parent_author = post.post_root_author;
  // If data has no field options - return result of simply post method of dsteem
  if (!_.has(parsedData, 'options')) return dsteemModel.post(post, account.postingKey);
  // else return result of post method with options(beneficiaries)
  const { options } = parsedData;
  options.author = account.name;
  const { result, error } = await dsteemModel.postWithOptions(
    post, parsedData.options, account.postingKey,
  );
  if (error && error.message.match('beneficiaries')) return dsteemModel.post(post, account.postingKey);
  return { result, error };
};

const updateHelper = async (author, comment) => {
  const accounts = await addBotsToEnv.setEnvData();
  if (accounts.error) return { error: accounts.error };
  let rootAcc = _.find(accounts.proxyBots, (acc) => acc.name === author);
  if (!rootAcc) rootAcc = _.find(accounts.reviewBots, (acc) => acc.name === author);
  comment.author = rootAcc.name;
  if (comment.post_root_author) comment.parent_author = comment.post_root_author;
  const {
    result: updateResult,
    error: updateError,
  } = await dsteemModel.post(comment, rootAcc.postingKey);
  if (updateResult) return { result: updateResult };
  // if dsteem method returns special error - message neednt to be deleted
  if (regExp.steemErrRegExp.test(updateError.message)) return { error: { message: 'update error' } };
  return { error: updateError };
};

const permlinkGenerator = (post, account) => (post.parent_author
  ? `@${post.parent_author}/${post.parent_permlink}#@${account.name}/${post.permlink}`
  : `@${account.name}/${post.permlink}`);

const chooseApp = (app) => {
  if (new RegExp(/waivio/).test(app)) {
    return 'www.waivio.com';
  } if (new RegExp(/investarena/).test(app)) {
    return 'www.investarena.com';
  } if (new RegExp(/beaxy/).test(app)) {
    return 'crypto.investarena.com';
  }
  return 'waivio';
};

module.exports = { switcher };
