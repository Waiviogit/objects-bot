const _ = require('lodash');
const config = require('config');
const validators = require('controllers/validators');
const { actionTypes, regExp } = require('constants/index');
const addBotsToEnv = require('utilities/helpers/serviceBotsHelper');
const { hiveClient, hiveOperations } = require('utilities/hiveApi');
const { parseMetadata } = require('utilities/helpers/updateMetadata');
const authoriseUser = require('utilities/authorazation/authoriseUser');

const switcher = async (data, next) => {
  switch (data.id) {
    case actionTypes.GUEST_UPDATE_ACCOUNT:
      if (_.has(data, 'data.operations[0][1].json')
          && _.includes(['account_update', 'account_update_2'], data.data.operations[0][1].id)) {
        return guestUpdateAccountJSON(data.data.operations[0][1].json, next);
      }
      return errorGenerator(next);
    case actionTypes.GUEST_REBLOG:
      if (_.has(data, 'data.operations[0][1].json')) {
        return guestReblogJSON(data.data.operations[0][1].json, next);
      }
      return errorGenerator(next);
    case actionTypes.GUEST_VOTE:
      if (_.has(data, 'data.operations[0][1]')) {
        return guestVoteJSON(data.data.operations[0][1], next);
      }
      return errorGenerator(next);
    case actionTypes.GUEST_CREATE:
      if (data.json) return guestCreateJSON(data.json, next);
      return errorGenerator(next);
    case actionTypes.GUEST_FOLLOW_WOBJECT:
      if (_.has(data, 'data.operations[0][1].json')) {
        return guestFollowWobjectJSON(data.data.operations[0][1].json, next);
      }
      return errorGenerator(next);
    case actionTypes.GUEST_FOLLOW:
      if (_.has(data, 'data.operations[0][1].json')) {
        return guestFollowJSON(data.data.operations[0][1].json, next);
      }
      return errorGenerator(next);
    case actionTypes.GUEST_SUBSCRIBE_NOTIFICATIONS:
      if (_.has(data, 'data.operations[0][1].json')) {
        return guestSubscribeNotificationsJSON(data.data.operations[0][1].json, next);
      }
      return errorGenerator(next);
    case actionTypes.GUEST_ACCEPT_REFERRAL_LICENCE:
    case actionTypes.GUEST_REJECT_REFERRAL_LICENCE:
    case actionTypes.GUEST_ADD_REFERRAL_AGENT:
      if (_.has(data, 'data.operations[0][1].json')) {
        return guestReferralCustomJson(
          { data: data.data.operations[0][1].json, id: data.id, next },
        );
      }
      return errorGenerator(next);
    case actionTypes.GUEST_WOBJ_RATING:
      if (_.has(data, 'data.operations[0][1].json')) {
        return guestRatingWobj(data.data.operations[0][1].json, next);
      }
      return errorGenerator(next);
    case actionTypes.GUEST_HIDE_POST:
    case actionTypes.GUEST_HIDE_COMMENT:
      if (_.has(data, 'data.operations[0][1].json')) {
        return guestHideContent(data.data.operations[0][1].json, data.id, next);
      }
      return errorGenerator(next);
    default:
      return errorGenerator(next);
  }
};

const guestReferralCustomJson = async ({ data, id, next }) => {
  const value = validators.validate(data, validators.customJson.referralSchema, next);

  if (!value) return;
  const { error } = await authoriseUser.authorise(value.guestName || value.agent);

  if (error) return next(error);

  const { result, error: broadcastError } = await accountsSwitcher({
    id,
    json: JSON.stringify(value),
  });

  if (broadcastError) return next(broadcastError);
  return result;
};

const guestVoteJSON = async (data, next) => {
  const value = validators.validate(data, validators.customJson.voteSchema, next);

  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value.voter);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher({
      id: actionTypes.GUEST_VOTE,
      json: JSON.stringify(value),
    });

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestCreateJSON = async (data, next) => {
  const value = validators.validate(data, validators.customJson.createSchema, next);

  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value.userId);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher({
      id: actionTypes.GUEST_CREATE,
      json: JSON.stringify(value),
    });

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestFollowWobjectJSON = async (data, next) => {
  const value = validators.validate(
    parseMetadata(data, next), validators.customJson.followWobjSchema, next,
  );

  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value[1].user);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher({
      id: actionTypes.GUEST_FOLLOW_WOBJECT,
      json: JSON.stringify(value),
    });

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestFollowJSON = async (data, next) => {
  const value = validators.validate(
    parseMetadata(data, next), validators.customJson.followSchema, next,
  );

  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value[1].follower);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher({
      id: actionTypes.GUEST_FOLLOW,
      json: JSON.stringify(value),
    });

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestReblogJSON = async (data, next) => {
  const value = validators.validate(
    parseMetadata(data, next), validators.customJson.reblogSchema, next,
  );

  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value[1].account);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher({
      id: actionTypes.GUEST_REBLOG,
      json: JSON.stringify(value),
    });

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestUpdateAccountJSON = async (data, next) => {
  const value = validators.validate(
    parseMetadata(data, next), validators.customJson.updateSchema, next,
  );

  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value.account);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher(
      { id: actionTypes.GUEST_UPDATE_ACCOUNT, json: JSON.stringify(value) },
    );

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestRatingWobj = async (data, next) => {
  const value = validators.validate(
    parseMetadata(data, next),
    validators.customJson.guestRatingSchema, next,
  );
  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value.guestName);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher(
      { id: actionTypes.GUEST_WOBJ_RATING, json: JSON.stringify(value) },
    );

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestHideContent = async (data, id, next) => {
  const value = validators.validate(
    parseMetadata(data, next),
    validators.customJson.guestHideContentSchema, next,
  );
  if (!value) return;
  const { error, isValid } = await authoriseUser.authorise(value.guestName);

  if (error) return next(error);
  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher(
      { id, json: JSON.stringify(value) },
    );

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const guestSubscribeNotificationsJSON = async (data, next) => {
  const value = validators.validate(
    parseMetadata(data, next), validators.customJson.subscribeNotificationsSchema, next,
  );
  if (!value) return;

  const { error, isValid } = await authoriseUser.authorise(value[1].follower);
  if (error) return next(error);

  if (isValid) {
    const { result, error: broadcastError } = await accountsSwitcher({
      id: actionTypes.GUEST_SUBSCRIBE_NOTIFICATIONS,
      json: JSON.stringify(value),
    });

    if (broadcastError) return next(broadcastError);
    return result;
  }
};

const accountsSwitcher = async (data, botType = 'proxyBots', customJsonFlag = 'custom_json') => {
  let err;
  const accounts = await addBotsToEnv.setEnvData();
  if (accounts.error) return { error: accounts.error };
  for (let counter = 0; counter < accounts[botType].length; counter++) {
    const account = accounts[botType][config[customJsonFlag].account];
    const { result, error } = await hiveClient.execute(
      hiveOperations.customJSON,
      { data, account },
    );
    if (result) {
      config[customJsonFlag].account === accounts[botType].length - 1
        ? config[customJsonFlag].account = 0
        : config[customJsonFlag].account += 1;
      return { result };
    } if (error && regExp.steemErrRegExp.test(error.message)) {
      config[customJsonFlag].account === accounts[botType].length - 1
        ? config[customJsonFlag].account = 0
        : config[customJsonFlag].account += 1;
      err = error;
      console.warn(`ERR[Custom_Json] RPCError: ${error.message}`);
      continue;
    }
    err = error;
    break;
  }
  return { error: err };
};

const errorGenerator = (next) => {
  const error = { status: 422, message: 'Invalid request data' };

  return next(error);
};

module.exports = { switcher, accountsSwitcher };
