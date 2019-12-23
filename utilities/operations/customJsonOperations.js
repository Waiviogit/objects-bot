const { actionTypes, accountsData, regExp } = require( '../../constants' );
const validators = require( '../../controllers/validators' );
const { parseMetadata } = require( '../helpers/updateMetadata' );
const config = require( '../../config' );
const { dsteemModel } = require( '../../models' );
const authoriseUser = require( '../authorazation/authoriseUser' );
const _ = require( 'lodash' );

const switcher = async ( data, next ) => {
    switch ( data.id ) {
        case actionTypes.GUEST_VOTE :
            if( _.has( data, 'data.operations[0][1]' ) ) {
                return await guestVoteJSON( data.data.operations[ 0 ][ 1 ], next );
            }
            return errorGenerator( data, next );
        case actionTypes.GUEST_CREATE :
            if( data.json ) return await guestCreateJSON( data.json, next );
            return errorGenerator( data, next );
        case actionTypes.GUEST_FOLLOW_WOBJECT :
            if( _.has( data, 'data.operations[0][1].json' ) ) {
                return await guestFollowWobjectJSON( data.data.operations[ 0 ][ 1 ].json, next );
            }
            return errorGenerator( data, next );
        case actionTypes.GUEST_FOLLOW :
            if( _.has( data, 'data.operations[0][1].json' ) ) {
                return await guestFollowJSON( data.data.operations[ 0 ][ 1 ].json, next );
            }
            return errorGenerator( data, next );
        default :
            return errorGenerator( data, next );
    }
};

const guestVoteJSON = async ( data, next ) => {
    const value = validators.validate( data, validators.customJson.voteSchema, next );

    if ( !value ) return;
    const { error, isValid } = await authoriseUser.authorise( value.voter );

    if ( error ) return next( error );
    else if ( isValid ) {
        const { result, error: broadcastError } = await accountsSwitcher( {
            id: actionTypes.GUEST_VOTE,
            json: JSON.stringify( value )
        } );

        if ( broadcastError ) return next( broadcastError );
        return result;
    }
};

const guestCreateJSON = async ( data, next ) => {
    const value = validators.validate( data, validators.customJson.createSchema, next );

    if ( !value ) return;
    const { error, isValid } = await authoriseUser.authorise( value.userId );

    if ( error ) return next( error );
    else if ( isValid ) {
        const { result, error: broadcastError } = await accountsSwitcher( {
            id: actionTypes.GUEST_CREATE,
            json: JSON.stringify( value )
        } );

        if ( broadcastError ) return next( broadcastError );
        return result;
    }
};

const guestFollowWobjectJSON = async ( data, next ) => {
    const value = validators.validate( parseMetadata( data, next ), validators.customJson.followWobjSchema, next );

    if ( !value ) return;
    const { error, isValid } = await authoriseUser.authorise( value[ 1 ].user );

    if ( error ) return next( error );
    else if( isValid ) {
        const { result, error: broadcastError } = await accountsSwitcher( {
            id: actionTypes.GUEST_FOLLOW_WOBJECT,
            json: JSON.stringify( value )
        } );

        if ( broadcastError ) return next( broadcastError );
        return result;
    }
};

const guestFollowJSON = async ( data, next ) => {
    const value = validators.validate( parseMetadata( data, next ), validators.customJson.followSchema, next );

    if ( !value ) return;
    const { error, isValid } = await authoriseUser.authorise( value[ 1 ].follower );

    if ( error ) return next( error );
    else if( isValid ) {
        const { result, error: broadcastError } = await accountsSwitcher( { id: actionTypes.GUEST_FOLLOW, json: JSON.stringify( value ) } );

        if ( broadcastError ) return next( broadcastError );
        return result;
    }
};

const accountsSwitcher = async ( data ) => {
    const account = accountsData.guestOperationAccounts[
        config.custom_json.account === accountsData.guestOperationAccounts.length - 1 ? config.custom_json.account = 0 : config.custom_json.account += 1
    ];

    const { result, error } = await dsteemModel.customJSON( data, account );
    if( result ) {
        config.custom_json.attempts = 0;
        return { result };
    }else if( error && regExp.steemErrRegExp.test( error.message ) && config.custom_json.attempts < accountsData.guestOperationAccounts.length -1 ) {
        config.custom_json.attempts += 1;
        await accountsSwitcher( data );
    }
    config.custom_json.attempts = 0;
    return { error };
};

const errorGenerator = ( data, next ) => {
    const error = { status: 422, message: 'Invalid request data' };

    return next( error );
};

module.exports = { switcher };
