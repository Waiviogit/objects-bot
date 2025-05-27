const { objectOperations, importVote } = require('utilities');
const validators = require('controllers/validators');
const config = require('config');
const checkForBlock = require('../utilities/guestUser/checkForBlock');

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
  const { error, result } = await objectOperations.AppendObjectOp(value);

  if (error) return next(error);
  res.result = result;
  next();
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
};
