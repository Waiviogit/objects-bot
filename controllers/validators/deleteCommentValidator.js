const Joi = require('joi');

exports.dataShcema = Joi.object().keys({
  id: Joi.string().required(),
  data: Joi.object().keys({
    root_author: Joi.string().required(),
    permlink: Joi.string().required(),
  }).required(),
  userName: Joi.string().required(),
});
