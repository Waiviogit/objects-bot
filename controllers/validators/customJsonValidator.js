const Joi = require( '@hapi/joi' );

exports.voteSchema = Joi.object().keys( {
    voter: Joi.string().required(),
    author: Joi.string().required(),
    permlink: Joi.string().required(),
    weight: Joi.number().required()
} ).options( { allowUnknown: true, stripUnknown: true } );


exports.createSchema = Joi.object().keys( {
    userId: Joi.string().required(),
    displayName: Joi.string().required(),
    json_metadata: Joi.string().required()
} ).options( { allowUnknown: true, stripUnknown: true } );


exports.followWobjSchema = Joi.array().ordered(
    Joi.string().valid( 'follow' ).required(),
    Joi.object().keys( {
        user: Joi.string().required(),
        author_permlink: Joi.string().required(),
        what: Joi.array().default( [] ).required()
    } )
).options( { allowUnknown: true, stripUnknown: true } );


exports.followSchema = Joi.array().ordered(
    Joi.string().valid( 'follow' ).required(),
    Joi.object().keys( {
        follower: Joi.string().required(),
        following: Joi.string().required(),
        what: Joi.array().default( [] ).required()
    } ) ).options( { allowUnknown: true, stripUnknown: true } );
