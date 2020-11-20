const Joi = require('@hapi/joi');
const { FIELDS_NAMES } = require('constants/wobjectsData');

exports.createSchema = Joi.object().keys({
  author: Joi.string().required(),
  title: Joi.string().allow('').required(),
  body: Joi.string().allow('').required(),
  permlink: Joi.string().required(),
  objectName: Joi.string().required(),
  locale: Joi.string().required(),
  isExtendingOpen: Joi.boolean().required(),
  isPostingOpen: Joi.boolean().required(),
  parentAuthor: Joi.string().allow('').required(),
  parentPermlink: Joi.string().required(),
}).options({ allowUnknown: true });

exports.appendSchema = Joi.object().keys({
  author: Joi.string().required(),
  body: Joi.string().allow('').required(),
  permlink: Joi.string().required(),
  parentAuthor: Joi.string().allow('').required(),
  parentPermlink: Joi.string().required(),
  title: Joi.string().allow('').default('').required(),
  field: Joi.object().keys({
    name: Joi.string().required(),
    locale: Joi.string().required(),
    body: Joi.string()
      .allow('')
      .default('')
      .when('name', {
        is: FIELDS_NAMES.GALLERY_ALBUM,
        then: Joi.string().insensitive().invalid('related'),
      })
      .required(),
  }).required(),
}).options({ allowUnknown: true });
