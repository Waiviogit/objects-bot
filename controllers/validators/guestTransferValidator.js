const Joi = require('@hapi/joi');
const { AVAILABLE_TOKEN, AVAILABLE_TOKEN_WITHDRAW } = require('constants/transferData');

exports.dataShcema = Joi.object().keys({
  id: Joi.string().required(),
  account: Joi.string().required(),
  data: Joi.object().keys({
    to: Joi.string().required(),
    quantity: Joi.number().required(),
    symbol: Joi.string().valid(...Object.values(AVAILABLE_TOKEN)).required(),
    memo: Joi.string().allow('').default(''),
  }).required(),
});

exports.withdrawSchema = Joi.object().keys({
  id: Joi.string().required(),
  account: Joi.string().required(),
  data: Joi.object().keys({
    quantity: Joi.number().required(),
    inputSymbol: Joi.string().valid(...Object.values(AVAILABLE_TOKEN)).required(),
    outputSymbol: Joi.string().valid(...Object.keys(AVAILABLE_TOKEN_WITHDRAW)).required(),
    address: Joi.string().required(),
  }).required(),
});
