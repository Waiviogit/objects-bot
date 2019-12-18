const permlinkGenerator = require( '../helpers/permlinkGenerator' );
const handleError = require( '../helpers/handleError' );
const { dsteemModel } = require( '../../models' );
const { getPostData, getOptions, getAppendRequestBody } = require( '../../utilities/helpers/postingData' );
const { actionTypes, accountsData } = require( '../../constants' );
const config = require( '../../config' );

const createObjectTypeOp = async ( body ) => {
    const data = { ...body, permlink: permlinkGenerator( body.objectType ) };

    let account = accountsData.basicAccounts[ config.objects.account ];
    console.info( `INFO[CreateObjectType] Try to create object type | bot: ${account.name} | request body: ${JSON.stringify( body )}` );
    const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
        getPostData( data, account, actionTypes.CREATE_OBJECT_TYPE ),
        getOptions( data, account, actionTypes.CREATE_OBJECT_TYPE ),
        account.postingKey
    );

    if( transactionStatus ) {
        const payload = { transactionId: transactionStatus.id, author: account.name, permlink: data.permlink };
        config.objects.account === accountsData.basicAccounts.length - 1 ? config.objects.account = 0 : config.objects.account += 1;
        config.objects.attempts = 0;
        console.info( `INFO[CreateObjectType] Object type successfully created | response body: ${JSON.stringify( payload )}` );
        return { result: { status: 200, json: payload } };
    } else if ( e && e.name === 'RPCError' && config.objects.attempts < accountsData.basicAccounts.length - 1 ) {
        config.objects.account === accountsData.basicAccounts.length - 1 ? config.objects.account = 0 : config.objects.account += 1;
        config.objects.attempts += 1;
        console.warn( `ERR[CreateObjectType] RPCError: ${e.message}` );
        await createObjectTypeOp( body );
    }

    if ( config.objects.attempts === accountsData.basicAccounts.length - 1 || e.name !== 'RPCError' ) {
        console.error( `ERR[CreateObjectType] Create type failed | Error: ${e.message}` );
    }
    config.objects.attempts = 0;
    return handleError( e.message );
};

const createObjectOp = async( body ) => {
    let account = accountsData.basicAccounts[ config.objects.account ];
    console.info( `INFO[CreateObject] Try create | bot: ${account.name} | request body: ${JSON.stringify( body )}` );
    const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
        getPostData( body, account, actionTypes.CREATE_OBJECT ),
        getOptions( body, account ),
        account.postingKey
    );

    if ( transactionStatus ) {
        console.info( 'INFO[CreateObject] Successfully created' );
        console.info( 'INFO[CreateObject] Recall Append object' );
        config.objects.account === accountsData.basicAccounts.length - 1 ? config.objects.account = 0 : config.objects.account += 1;
        config.objects.attempts = 0;
        return await AppendObjectOp( getAppendRequestBody( body, account ) );
    }else if ( e && e.name === 'RPCError' && config.objects.attempts < accountsData.basicAccounts.length - 1 ) {
        config.objects.account === accountsData.basicAccounts.length - 1 ? config.objects.account = 0 : config.objects.account += 1;
        config.objects.attempts += 1;
        console.warn( `ERR[CreateObject] RPCError: ${e.message}` );
        await createObjectOp( body );
    }
    if ( config.objects.attempts === accountsData.basicAccounts.length - 1 || e.name !== 'RPCError' ) {
        console.error( `ERR[CreateObject] Create failed | Error: ${e.message}` );
    }
    config.objects.attempts = 0;
    return handleError( e.message );
};

const AppendObjectOp = async ( body ) => {
    let account = accountsData.basicAccounts[ config.objects.account ];

    console.info( `INFO[AppendObject] Try append | bot: ${account.name} | request body: ${JSON.stringify( body )}` );
    const { error: e, result: transactionStatus } = await dsteemModel.postWithOptions(
        getPostData( body, account, actionTypes.APPEND_OBJECT ),
        getOptions( body, account ),
        account.postingKey
    );

    if( transactionStatus ) {
        const payload = { author: account.name, permlink: body.permlink, parentAuthor: body.parentAuthor, parentPermlink: body.parentPermlink };
        console.info( `INFO[CreateObjectType] Object type successfully created | response body: ${JSON.stringify( payload )}` );
        config.objects.account === accountsData.basicAccounts.length - 1 ? config.objects.account = 0 : config.objects.account += 1;
        config.objects.attempts = 0;
        return { result: { status: 200, json: payload } };
    } else if ( e && e.name === 'RPCError' && config.objects.attempts < accountsData.basicAccounts.length - 1 ) {
        console.warn( `ERR[AppendObject] RPCError: ${e.message}` );
        config.objects.account === accountsData.basicAccounts.length - 1 ? config.objects.account = 0 : config.objects.account += 1;
        config.objects.attempts += 1;
        await AppendObjectOp( body );
    }

    if ( config.objects.attempts === accountsData.basicAccounts.length - 1 || e.name !== 'RPCError' ) {
        console.error( `ERR[AppendObject] Append failed | Error: ${e.message}` );
    }
    config.objects.attempts = 0;
    return handleError( e.message );
};

module.exports = { createObjectTypeOp, createObjectOp, AppendObjectOp };
