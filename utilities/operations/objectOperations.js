const permlinkGenerator = require( '../helpers/permlinkGenerator' );
const handleError = require( '../helpers/handleError' );
const { dsteemModel } = require( '../../models' );
const { getPostData, getOptions, getAppendRequestBody } = require( '../../utilities/helpers/postingData' );
const { actionTypes, accountsData } = require( '../../constants' );

const createObjectTypeOp = async ( body ) => {
    const data = { ...body, permlink: permlinkGenerator( body.objectType ) };
    let error = '';

    for ( let account of accountsData.basicAccounts ) {
        console.info( `INFO[CreateObjectType] Try to create object type | bot: ${account.name} | request body: ${JSON.stringify( body )}` );
        const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
            getPostData( data, account, actionTypes.CREATE_OBJECT_TYPE ),
            getOptions( data, account, actionTypes.CREATE_OBJECT_TYPE ),
            account.postingKey
        );

        if( transactionStatus ) {
            const payload = { transactionId: transactionStatus.id, author: account.name, permlink: data.permlink };

            console.info( `INFO[CreateObjectType] Object type successfully created | response body: ${JSON.stringify( payload )}` );
            return { result: { status: 200, json: payload } };
        } else if ( e && e.name === 'RPCError' ) {
            console.warn( `ERR[CreateObjectType] RPCError: ${e.message}` );
            error = e.message;
            continue;
        }
        return handleError( e.message );
    }
    console.error( `ERR[CreateObjectType] Create type failed | Error: ${error}` );
    return handleError( error );
};

const createObjectOp = async( body ) => {
    let error = '';

    for ( let account of accountsData.basicAccounts ) {
        console.info( `INFO[CreateObject] Try create | bot: ${account.name} | request body: ${JSON.stringify( body )}` );
        const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
            getPostData( body, account, actionTypes.CREATE_OBJECT ),
            getOptions( body, account ),
            account.postingKey
        );

        if ( transactionStatus ) {
            console.info( 'INFO[CreateObject] Successfully created' );
            console.info( 'INFO[CreateObject] Recall Append object' );
            return await AppendObjectOp( getAppendRequestBody( body, account ) );
        }else if ( e && e.name === 'RPCError' ) {
            console.warn( `ERR[CreateObject] RPCError: ${e.message}` );
            error = e.message;
            continue;
        }
        return handleError( e.message );
    }
    console.error( `ERR[CreateObject] Create failed | Error: ${error}` );
    return handleError( error );
};

const AppendObjectOp = async ( body ) => {
    let error = '';

    for ( let account of accountsData.basicAccounts ) {
        console.info( `INFO[AppendObject] Try append | bot: ${account.name} | request body: ${JSON.stringify( body )}` );
        const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
            getPostData( body, account, actionTypes.APPEND_OBJECT ),
            getOptions( body, account ),
            account.postingKey
        );

        if( transactionStatus ) {
            const payload = { author: account.name, permlink: body.permlink, parentAuthor: body.parentAuthor, parentPermlink: body.parentPermlink };

            console.info( `INFO[CreateObjectType] Object type successfully created | response body: ${JSON.stringify( payload )}` );
            return { result: { status: 200, json: payload } };
        } else if ( e && e.name === 'RPCError' ) {
            console.warn( `ERR[AppendObject] RPCError: ${e.message}` );
            error = e.message;
            continue;
        }
        return handleError( e.message );
    }
    console.error( `ERR[AppendObject] Append failed | Error: ${error}` );
    return handleError( error );
};

module.exports = { createObjectTypeOp, createObjectOp, AppendObjectOp };
