const { objectOperations, importVote } = require('utilities');
const validators = require('controllers/validators');
const config = require('config');
const { FIELDS_NAMES } = require('@waivio/objects-processor');
const checkForBlock = require('../utilities/guestUser/checkForBlock');
const { htmlThreatDetector } = require('../utilities/operations/htmlThreatDetector');
const { parseJson } = require('../utilities/helpers/jsonHelper');

const processCreateObjectType = async (req, res, next) => {
  if (!req.body.objectType) {
    console.error(`ERR[CreateObjectType] Invalid request data: ${JSON.stringify(req.body)}`);
    return next({ status: 422, message: 'Not enough data' });
  }
  if (req.body.key !== config.objectTypeKey) {
    console.error(`ERR[CreateObjectType] Invalid request data: ${JSON.stringify(req.body)}`);
    return next({ status: 401, message: 'Not allowed' });
  }

  const { error, result } = await objectOperations.createObjectTypeOp(req.body);

  if (error) return next(error);
  res.result = result;
  next();
};

const processCreateObject = async (req, res, next) => {
  const value = validators.validate(req.body, validators.object.createSchema, next);
  if (!value) return;
  const { error: blockedError } = await checkForBlock(value.author);
  if (blockedError) return next(blockedError);
  const { error, result } = await objectOperations.createObjectOp(value);

  if (error) return next(error);
  res.result = result;
  next();
};

const processAppendObject = async (req, res, next) => {
  const value = validators.validate(req.body, validators.object.appendSchema, next);

  if (!value) return;
  const { error: blockedError } = await checkForBlock(value.author);
  if (blockedError) return next(blockedError);

  if (value.field.name === FIELDS_NAMES.HTML_CONTENT) {
    const { error: htmlError } = await htmlThreatDetector(value.field.body);
    if (htmlError) return next(htmlError);
  }

  const { error, result } = await objectOperations.AppendObjectOp(value);

  if (error) return next(error);
  res.result = result;
  next();
};

const validateAppendObject = async (req, res, next) => {
  const value = validators.validate(req.body, validators.object.appendSchema, next);

  if (!value) return;
  const { error: blockedError } = await checkForBlock(value.author);
  if (blockedError) return next(blockedError);

  if (value.field.name === FIELDS_NAMES.HTML_CONTENT) {
    const { error: htmlError } = await htmlThreatDetector(value.field.body);
    if (htmlError) return next(htmlError);
  }

  return res.status(200).json({ message: 'Success' });
};

const voteForField = async (req, res, next) => {
  const value = validators.validate(req.body, validators.object.voteSchema, next);
  if (req.headers.api_key !== config.apiKey) return next({ status: 401, message: 'unauthorized' });

  if (!value) return;
  const { error: blockedError } = await checkForBlock(value.voter);
  if (blockedError) return next(blockedError);
  const { error, result } = await importVote.voteForField({ ...value, voteRequest: true });

  if (error) return next(error);
  res.result = result;
  next();
};

module.exports = {
  processCreateObjectType,
  processCreateObject,
  processAppendObject,
  voteForField,
  validateAppendObject,
};
