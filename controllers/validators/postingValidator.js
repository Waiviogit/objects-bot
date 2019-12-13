const Joi = require( '@hapi/joi' );

exports.Schema = Joi.object().keys( {
    author: Joi.string().required(),
    permlink: Joi.string().required(),
    title: Joi.string().allow( '' ).default( '' ).required(),
    parent_author: Joi.string().allow( '' ).default( '' ).required(),
    parent_permlink: Joi.string(),
    body: Joi.string().required(),
    json_metadata: Joi.string().required(),
    comment_options: Joi.object().keys( {
        extensions: Joi.array().items(
            Joi.array().ordered(
                Joi.number().allow( 0 ).default( 0 ),
                Joi.object().keys( {
                    beneficiaries: Joi.array().items(
                        Joi.object().keys( {
                            account: Joi.string(),
                            weight: Joi.number()
                        } )
                    )
                } )
            )
        ).required()
    } )
} ).options( { allowUnknown: true, stripUnknown: true } );
