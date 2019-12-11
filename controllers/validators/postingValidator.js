const Joi = require( '@hapi/joi' );

exports.Schema = Joi.object().keys( {
    author: Joi.string().required(),
    permlink: Joi.string().required(),
    title: Joi.string().required(),
    parent_author: Joi.string().allow( '' ).default( '' ).required(),
    parent_permlink: Joi.string(),
    body: Joi.string().required(),
    json_metadata: Joi.string().required(),
    comment_options: Joi.string().required()
} ).options( { allowUnknown: true, stripUnknown: true } );
