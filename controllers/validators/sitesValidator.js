const Joi = require('@hapi/joi');

exports.createWebsite = Joi.object().keys({
  name: Joi.string().required(),
  parent: Joi.string().required(),
  owner: Joi.string().required(),
  host: Joi.string().required(),
}).options({ allowUnknown: true, stripUnknown: true });
