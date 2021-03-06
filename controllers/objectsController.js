const { objectOperations } = require('utilities');
const validators = require('controllers/validators');

const processCreateObjectType = async (req, res, next) => {
  if (!req.body.objectType) {
    console.error(`ERR[CreateObjectType] Invalid request data: ${JSON.stringify(req.body)}`);
    return next({ status: 422, message: 'Not enough data' });
  }
  const { error, result } = await objectOperations.createObjectTypeOp(req.body);

  if (error) return next(error);
  res.result = result;
  next();
};

const processCreateObject = async (req, res, next) => {
  const value = validators.validate(req.body, validators.object.createSchema, next);
  if (!value) return;
  const { error, result } = await objectOperations.createObjectOp(value);

  if (error) return next(error);
  res.result = result;
  next();
};

const processAppendObject = async (req, res, next) => {
  const value = validators.validate(req.body, validators.object.appendSchema, next);

  if (!value) return;
  const { error, result } = await objectOperations.AppendObjectOp(value);

  if (error) return next(error);
  res.result = result;
  next();
};

module.exports = {
  processCreateObjectType,
  processCreateObject,
  processAppendObject,
};
