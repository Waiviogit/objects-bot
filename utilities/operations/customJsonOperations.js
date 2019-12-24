const { actionTypes, accountsData, regExp } = require( '../../constants' );
const validators = require( '../../controllers/validators' );
const { parseMetadata } = require( '../helpers/updateMetadata' );
const config = require( '../../config' );
const { dsteemModel } = require( '../../models' );
const authoriseUser = require( '../authorazation/authoriseUser' );
const _ = require( 'lodash' );

const switcher = async ( data, next ) => {
    switch ( data.id ) {
        case actionTypes.GUEST_UPDATE_ACCOUNT :
            if( _.has( data, 'data.operations[0][1].json' ) && data.data.operations[ 0 ][ 1 ].id === 'account_update' ) {
                return await guestUpdateAccountJSON( data.data.operations[ 0 ][ 1 ].json, next );
            }
            return errorGenerator( next );
        case actionTypes.GUEST_REBLOG :
            if( _.has( data, 'data.operations[0][1].json' ) ) {
                return await guestReblogJSON( data.data.operations[ 0 ][ 1 ].json, next );
            }
            return errorGenerator( next );
        case actionTypes.GUEST_VOTE :
            if( _.has( data, 'data.operations[0][1]' ) ) {
                return await guestVoteJSON( data.data.operations[ 0 ][ 1 ], next );
            }
            return errorGenerator( next );
        case actionTypes.GUEST_CREATE :
            if( data.json ) return await guestCreateJSON( data.json, next );
            return errorGenerator( next );
        case actionTypes.GUEST_FOLLOW_WOBJECT :
            if( _.has( data, 'data.operations[0][1].json' ) ) {
                return await guestFollowWobjectJSON( data.data.operations[ 0 ][ 1 ].json, next );
            }
            return errorGenerator( next );
        case actionTypes.GUEST_FOLLOW :
            if( _.has( data, 'data.operations[0][1].json' ) ) {
                return await guestFollowJSON( data.data.operations[ 0 ][ 1 ].json, next );
            }
            return errorGenerator( next );
        default :
            return errorGenerator( next );
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

const guestReblogJSON = async( data, next ) => {
    const value = validators.validate( parseMetadata( data, next ), validators.customJson.reblogSchema, next );

    if ( !value ) return;
    const { error, isValid } = await authoriseUser.authorise( value[ 1 ].account );

    if ( error ) return next( error );
    else if( isValid ) {
        const { result, error: broadcastError } = await accountsSwitcher( { id: actionTypes.GUEST_REBLOG, json: JSON.stringify( value ) } );

        if ( broadcastError ) return next( broadcastError );
        return result;
    }
};

const guestUpdateAccountJSON = async( data, next ) => {
    const value = validators.validate( parseMetadata( data, next ), validators.customJson.updateSchema, next );

    if ( !value ) return;
    const { error, isValid } = await authoriseUser.authorise( value.account );

    if ( error ) return next( error );
    else if( isValid ) {
        const { result, error: broadcastError } = await accountsSwitcher( { id: actionTypes.GUEST_UPDATE_ACCOUNT, json: JSON.stringify( value ) } );

        if ( broadcastError ) return next( broadcastError );
        return result;
    }
};

const accountsSwitcher = async ( data ) => {
    config.forecasts.account === accountsData.basicAccounts.length - 1 ? config.forecasts.account = 0 : config.forecasts.account += 1;
    let err;
    for ( let counter = 0; counter < accountsData.guestOperationAccounts.length; counter++ ) {
        const account = accountsData.guestOperationAccounts[ config.custom_json.account ];
        const { result, error } = await dsteemModel.customJSON( data, account );
        if( result ) {
            config.custom_json.account === accountsData.guestOperationAccounts.length - 1 ? config.custom_json.account = 0 : config.custom_json.account += 1;
            return { result };
        }else if( error && regExp.steemErrRegExp.test( error.message ) ) {
            config.custom_json.account === accountsData.guestOperationAccounts.length - 1 ? config.custom_json.account = 0 : config.custom_json.account += 1;
            err = error;
            console.warn( `ERR[Custom_Json] RPCError: ${error.message}` );
            continue;
        }
        err = error;
        break;
    }
    return { error: err };
};

const errorGenerator = ( next ) => {
    const error = { status: 422, message: 'Invalid request data' };

    return next( error );
};

module.exports = { switcher };
