const Joi = require( '@hapi/joi' );

exports.Schema = Joi.object().keys( {
    id: Joi.string().required(),
    data: Joi.object().keys( {
        operations: Joi.array().ordered(
            Joi.array().ordered(
                Joi.string(),
                Joi.object().keys( {
                    author: Joi.string().required(),
                    permlink: Joi.string().required(),
                    title: Joi.string().allow( '' ).default( '' ).required(),
                    parent_author: Joi.string().allow( '' ).default( '' ).required(),
                    parent_permlink: Joi.string(),
                    body: Joi.string().required(),
                    json_metadata: Joi.string().required()
                } ).required()
            ),
            Joi.array().ordered(
                Joi.string(),
                Joi.object().keys( {
                    author: Joi.string(),
                    permlink: Joi.string(),
                    allow_votes: Joi.boolean(),
                    allow_curation_rewards: Joi.boolean(),
                    max_accepted_payout: Joi.string(),
                    percent_steem_dollars: Joi.number().allow( 0 ),
                    extensions: Joi.array().items(
                        Joi.array().ordered(
                            Joi.number().allow( 0 ),
                            Joi.object().keys( {
                                beneficiaries: Joi.array().items(
                                    Joi.object().keys( {
                                        account: Joi.string(),
                                        weight: Joi.number()
                                    } )
                                )
                            } )
                        )
                    )
                } )
            )
        )
    } )
} ).options( { allowUnknown: true, stripUnknown: true } );
