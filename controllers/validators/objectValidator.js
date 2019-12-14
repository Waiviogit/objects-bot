const Joi = require( '@hapi/joi' );

exports.Schema = Joi.object().keys( {
    author: Joi.string().required(),
    title: Joi.string().allow( '' ).required(),
    body: Joi.string().allow( '' ).required(),
    permlink: Joi.string().required(),
    objectName: Joi.string().required(),
    locale: Joi.string().required(),
    isExtendingOpen: Joi.boolean().required(),
    isPostingOpen: Joi.boolean().required(),
    parentAuthor: Joi.string().allow( '' ).required(),
    parentPermlink: Joi.string().required()
} ).options( { allowUnknown: true, stripUnknown: true } );
