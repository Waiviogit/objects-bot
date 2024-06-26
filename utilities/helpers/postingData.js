const _ = require('lodash');
const { orderBy, uniqWith } = require('lodash');
const { actionTypes } = require('constants/index');
const config = require('config');
const requestHelper = require('utilities/helpers/requestHelper');
const { signComment } = require('./signatureHelper');

const getOptions = async (reqData, accData, type) => {
  const optionsData = {};
  let beneficiaries = [];

  switch (type) {
    case actionTypes.CREATE_OBJECT_TYPE:
    case actionTypes.FORECAST_EXPIRED:
      beneficiaries = orderBy([
        { weight: 1500, account: accData.name },
        { weight: 8500, account: config.appAccName },
      ], ['account'], ['asc']);
      break;
    case actionTypes.CREATE_OBJECT:
    case actionTypes.APPEND_OBJECT:
    default:
      const { user: checkForGuest } = await requestHelper.getUser(reqData.author);
      beneficiaries = orderBy(
        uniqWith([
          { weight: 3000, account: config.appObjectBeneficiaryAcc },
          {
            weight: 7000,
            account: checkForGuest && checkForGuest.auth ? accData.name : reqData.author,
          },
        ], (a, b) => a.account === b.account),
        ['account'],
        ['asc'],
      );
      break;
  }
  optionsData.author = accData.name;
  optionsData.extensions = [[0, { beneficiaries }]];
  optionsData.max_accepted_payout = '100000.000 HBD';
  optionsData.percent_hbd = 0;
  optionsData.percent_steem_dollars = 0;
  optionsData.allow_votes = true;
  optionsData.allow_curation_rewards = true;
  optionsData.permlink = reqData.permlink;
  return optionsData;
};

const addSignatureObject = ({ author, permlink }) => ({
  signature: signComment({ author, permlink }),
  signer: config.appAccName,
});

const getPostData = (reqData, accData, type) => {
  const appendObjPostData = {};
  const metadata = {
    app: `${config.appName}/${config.version}`,
    community: '',
    tags: [config.appendObjectTag, ...config.engineTags],
    ...reqData.datafinityObject && { datafinityObject: reqData.datafinityObject },
    ...reqData.importId && { importId: reqData.importId },
  };

  appendObjPostData.author = accData.name;
  appendObjPostData.body = reqData.body;
  appendObjPostData.permlink = reqData.permlink;
  appendObjPostData.title = '';

  switch (type) {
    case actionTypes.CREATE_OBJECT_TYPE:
      appendObjPostData.parent_author = '';
      appendObjPostData.parent_permlink = config.objectTypeTag;
      appendObjPostData.title = `Object Type - ${reqData.objectType}`;
      appendObjPostData.body = `Object Type - ${reqData.objectType} created`;
      metadata.wobj = {
        action: type,
        creator: reqData.author,
        name: reqData.objectType.trim().toLowerCase(),
      };
      metadata.signedTrx = addSignatureObject({
        author: appendObjPostData.author,
        permlink: appendObjPostData.permlink,
      });
      break;
    case actionTypes.CREATE_OBJECT:
      appendObjPostData.parent_author = reqData.parentAuthor;
      appendObjPostData.parent_permlink = reqData.parentPermlink;
      metadata.wobj = {
        action: type,
        creator: reqData.author,
        default_name: reqData.objectName,
        is_posting_open: Boolean(reqData.isPostingOpen),
        is_extending_open: Boolean(reqData.isExtendingOpen),
        locale: reqData.locale,
      };
      metadata.signedTrx = addSignatureObject({
        author: appendObjPostData.author,
        permlink: appendObjPostData.permlink,
      });
      break;
    case actionTypes.APPEND_OBJECT:
      appendObjPostData.parent_author = reqData.parentAuthor;
      appendObjPostData.parent_permlink = reqData.parentPermlink;
      metadata.wobj = {
        action: type,
        creator: reqData.author,
        field: reqData.field,
      };
      metadata.signedTrx = addSignatureObject({
        author: appendObjPostData.author,
        permlink: appendObjPostData.permlink,
      });
      break;
    case actionTypes.FORECAST_EXPIRED:
      appendObjPostData.parent_author = reqData.parentAuthor;
      appendObjPostData.parent_permlink = reqData.parentPermlink;
      metadata.app = `${reqData.marker ? reqData.marker : 'wia'}/1.0`;
      metadata.tags = 'expired_forecast';
      metadata[reqData.marker ? reqData.marker : 'wia'] = {
        action: type,
        exp_forecast: _.omit(reqData.expForecast, ['bars']),
      };
      break;
    default:
      break;
  }
  appendObjPostData.json_metadata = JSON.stringify(metadata);

  return appendObjPostData;
};

const getAppendRequestBody = (reqData, accData) => (
  {
    author: reqData.author,
    parentAuthor: accData.name,
    parentPermlink: reqData.permlink,
    body: `${reqData.author} added name(${reqData.locale || 'uk-UA'}):\n ${reqData.objectName}`,
    title: '',
    field: {
      name: 'name',
      body: reqData.objectName,
      locale: reqData.locale || 'uk-UA',
    },
    permlink: `${reqData.author}-${Math.random()
      .toString(36)
      .substring(2)}`,
    lastUpdated: Date.now(),
    wobjectName: reqData.objectName,
  }
);

module.exports = {
  getPostData, getOptions, getAppendRequestBody,
};
