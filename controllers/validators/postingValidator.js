const Joi = require( '@hapi/joi' );

exports.simpleSchema = Joi.object().keys( {
    author: Joi.string().required(),
    permlink: Joi.string().required(),
    title: Joi.string().allow( '' ).default( '' ).required(),
    parent_author: Joi.string().allow( '' ).default( '' ).required(),
    parent_permlink: Joi.string(),
    body: Joi.string().required(),
    json_metadata: Joi.string().required()
} ).required().options( { allowUnknown: true, stripUnknown: true } );


exports.optionsSchema = Joi.object().keys( {
    author: Joi.string().required(),
    permlink: Joi.string().required(),
    allow_votes: Joi.boolean().required(),
    allow_curation_rewards: Joi.boolean().required(),
    max_accepted_payout: Joi.string().required(),
    percent_steem_dollars: Joi.number().allow( 0 ).required(),
    extensions: Joi.array().items(
        Joi.array().ordered(
            Joi.number().allow( 0 ),
            Joi.object().keys( {
                beneficiaries: Joi.array().items(
                    Joi.object().keys( {
                        account: Joi.string().required(),
                        weight: Joi.number().required()
                    } ).required()
                )
            } ).required()
        )
    ).required()
} ).required().options( { allowUnknown: true } );
