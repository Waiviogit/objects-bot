const Joi = require('@hapi/joi');
const { AVAILABLE_TOKEN } = require('constants/transferData');

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
