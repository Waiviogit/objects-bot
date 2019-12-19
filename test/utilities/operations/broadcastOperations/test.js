const { getRandomString, redisGetter, sinon, redisQueue, dsteemModel, actionsRsmqClient, redisSetter, broadcastOperations, expect, validationHelper } = require( '../../../testHelper' );
const { postMock, botMock } = require( '../../../mocks' );
const { postAction, commentAction } = require( '../../../../constants/guestRequestsData' );
const accountsData = require( '../../../../constants/accountsData' );
const _ = require( 'lodash' );

describe( 'On broadcastOperations', async () => {
    beforeEach( async () => {
        sinon.stub( accountsData, 'guestOperationAccounts' ).value( botMock );
    } );
    afterEach( async () => {
        sinon.restore();
    } );
    describe( 'On postBroadcaster', async() => {
        describe( 'On success', async () => {
            let mock, message, mockPostData;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( 'OK' ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { result: 'OK' } ) );
                mock = postMock();
                mockPostData = validationHelper.postingValidator( mock );
                message = getRandomString( 10 );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: postAction.qname } );
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: postAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mockPostData ) );
            } );
            it( 'should successfully create post with options if it exists in queue', async () => {
                await broadcastOperations.postBroadcaster( 10, 10 );
                expect( dsteemModel.postWithOptions ).to.be.called;
            } );
            it( 'should successfully create post without options if it exists in queue', async () => {
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: postAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( _.omit( mockPostData, 'options' ) ) );
                await broadcastOperations.postBroadcaster( 10, 10 );
                expect( dsteemModel.post ).to.be.called;
            } );
            it( 'should successfully delete message from queue after posting', async () => {
                await broadcastOperations.postBroadcaster( 10, 10 );
                const { error, result } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: postAction.qname } );

                expect( error.message ).to.be.eq( 'No messages' );
            } );
            it( 'should delete data from redis after posting', async () => {
                await broadcastOperations.postBroadcaster( 10, 10 );
                const { result } = await redisGetter.getAllHashData( message );

                expect( result ).to.be.null;
            } );
        } );
        describe( 'On errors', async() => {
            let mock, message, mockPostData;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: postAction.qname } );
                sinon.spy( console, 'error' );
            } );
            describe( 'Empty queue', async () => {
                beforeEach( async () => {
                    await broadcastOperations.postBroadcaster( 10, 10 );
                } );
                it( 'should returns and write log if queue will be empty', async () => {
                    expect( console.error ).to.be.calledWith( 'ERR[PostBroadcasting] No messages' );
                } );
                it( 'should successfully returns if queue is empty', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.not.called;
                } );
            } );
            describe( 'switcher errors', async() => {
                beforeEach( async() => {
                    message = getRandomString( 10 );
                    mock = postMock();
                    mockPostData = validationHelper.postingValidator( mock );
                    await redisQueue.sendMessage( { client: actionsRsmqClient, qname: postAction.qname, message } );
                    await redisSetter.setActionsData( message, JSON.stringify( mockPostData ) );
                    await broadcastOperations.postBroadcaster( 10, 10 );
                } );
                it( 'should not delete message from queue if it not posted', async () => {
                    const { result } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: postAction.qname } );

                    expect( result.message ).to.be.eq( message );
                } );
                it( 'should not delete post data from redis if it not posted', async () => {
                    const { result } = await redisGetter.getAllHashData( message );

                    expect( JSON.parse( result ) ).to.be.deep.eq( mockPostData );
                } );
            } );
        } );

    } );
    describe( 'On commentBroadcaster', async () => {
        describe( 'On success', async () => {
            let mock, message, mockPostData;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( 'OK' ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( 'OK' ) );
                mock = postMock( { parentAuthor: getRandomString( 10 ) } );
                mockPostData = validationHelper.postingValidator( mock );
                message = getRandomString( 15 );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: commentAction.qname } );
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: commentAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mockPostData ) );
            } );
            it( 'should successfully send comment with options with valid data to chain', async () => {
                await broadcastOperations.commentBroadcaster( 10 );
                expect( dsteemModel.postWithOptions ).to.be.calledOnce;
            } );
            it( 'should successfully send comment with valid data to chain', async () => {
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: commentAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( _.omit( mockPostData, 'options' ) ) );
                await broadcastOperations.commentBroadcaster( 10 );

                expect( dsteemModel.post ).to.be.calledOnce;
            } );
            it( 'should delete message from queue after posting ', async () => {
                await broadcastOperations.commentBroadcaster( 10 );
                const { error } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: commentAction.qname } );

                expect( error.message ).to.be.eq( 'No messages' );
            } );
            it( 'should delete comment data from redis after posting', async () => {
                await broadcastOperations.commentBroadcaster( 10 );
                const { result } = await redisGetter.getAllHashData( message );

                expect( result ).to.be.null;
            } );
        } );
        describe( 'On errors', async() => {
            let mock, message, mockPostData;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: commentAction.qname } );
                sinon.spy( console, 'error' );
            } );
            describe( 'Empty queue', async () => {
                beforeEach( async () => {
                    await broadcastOperations.commentBroadcaster( 10 );
                } );
                it( 'should returns and write log if queue will be empty', async () => {
                    expect( console.error ).to.be.calledWith( 'ERR[CommentBroadcasting] No messages' );
                } );
                it( 'should successfully returns if queue is empty', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.not.called;
                } );
            } );
            describe( 'switcher errors', async() => {
                beforeEach( async() => {
                    message = getRandomString( 10 );
                    mock = postMock( { parentAuthor: getRandomString( 10 ) } );
                    mockPostData = validationHelper.postingValidator( mock );
                    await redisQueue.sendMessage( { client: actionsRsmqClient, qname: commentAction.qname, message } );
                    await redisSetter.setActionsData( message, JSON.stringify( mockPostData ) );
                    await broadcastOperations.commentBroadcaster( 10, 10 );
                } );
                it( 'should not delete message from queue if it not posted', async () => {
                    const { result } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: commentAction.qname } );

                    expect( result.message ).to.be.eq( message );
                } );
                it( 'should not delete post data from redis if it not posted', async () => {
                    const { result } = await redisGetter.getAllHashData( message );

                    expect( JSON.parse( result ) ).to.be.deep.eq( mockPostData );
                } );
            } );
        } );
    } );
} );
