const Joi = require('@hapi/joi');

exports.createWebsite = Joi.object().keys({
  name: Joi.string().required(),
  parentHost: Joi.string().required(),
  owner: Joi.string().required(),
  host: Joi.string().required(),
}).options({ allowUnknown: true, stripUnknown: true });

exports.deleteWebsite = Joi.object().keys({
  userName: Joi.string().required(),
  host: Joi.string().required(),
}).options({ allowUnknown: true, stripUnknown: true });

exports.sendInvoice = Joi.object().keys({
  userName: Joi.string().required(),
  host: Joi.string().required(),
  invoice: Joi.number().min(0).required(),
  countUsers: Joi.number().min(0).required(),
}).options({ allowUnknown: true, stripUnknown: true });
