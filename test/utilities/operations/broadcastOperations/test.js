const { getRandomString, redisGetter, sinon, redisQueue, dsteemModel, actionsRsmqClient, redisSetter, broadcastOperations, expect, accountsData } = require( '../../../testHelper' );
const { postMock } = require( '../../../mocks' );
const { postAction, commentAction } = require( '../../../../constants/guestRequestsData' );
const _ = require( 'lodash' );

describe( 'On broadcastOperations', async () => {
    describe( 'On postBroadcaster', async() => {
        describe( 'On success', async () => {
            let mock, message;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( 'OK' ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( 'OK' ) );
                mock = postMock();
                message = getRandomString( 10 );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: postAction.qname } );
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: postAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mock ) );
            } );
            afterEach( async () => {
                sinon.restore();
            } );
            it( 'should successfully create post with options if it exists in queue', async () => {
                await broadcastOperations.postBroadcaster( 10, 10 );
                expect( dsteemModel.postWithOptions.called ).to.true;
            } );
            it( 'should successfully create post without options if it exists in queue', async () => {
                mock.comment_options = {};
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: postAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mock ) );
                await broadcastOperations.postBroadcaster( 10, 10 );
                expect( dsteemModel.post.called ).to.true;
            } );
            it( 'should successfully delete message from queue after posting', async () => {
                await broadcastOperations.postBroadcaster( 10, 10 );
                const { error } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: postAction.qname } );

                expect( error.message ).to.eq( 'No messages' );
            } );
            it( 'should broadcasting post method will called with valid params', async () => {
                mock.comment_options = {};
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: postAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mock ) );
                await broadcastOperations.postBroadcaster( 10, 10 );
                mock.body += `\n This message was written by guest ${mock.author}, and is available at waivio.com/@${mock.author}/${mock.permlink}`;
                expect( dsteemModel.post.calledWith( _.omit( mock, [ 'comment_options' ] ), accountsData[ 0 ].postingKey ) ).to.true;
            } );
            it( 'should delete data from redis after posting', async () => {
                await broadcastOperations.postBroadcaster( 10, 10 );
                const { result } = await redisGetter.getAllHashData( message );

                expect( result ).to.null;
            } );
        } );
        describe( 'On errors', async() => {
            let mock, message;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: postAction.qname } );
                sinon.spy( console, 'log' );
            } );
            afterEach( async () => {
                sinon.restore();
            } );
            describe( 'Empty queue', async () => {
                beforeEach( async () => {
                    await broadcastOperations.postBroadcaster( 10, 10 );
                } );
                it( 'should returns and write log if queue will be empty', async () => {
                    expect( console.log.calledWith( 'No messages' ) );
                } );
                it( 'should successfully returns if queue is empty', async () => {
                    expect( dsteemModel.postWithOptions.notCalled ).to.true;
                } );
            } );
            describe( 'switcher errors', async() => {
                beforeEach( async() => {
                    message = getRandomString( 10 );
                    mock = postMock();
                    await redisQueue.sendMessage( { client: actionsRsmqClient, qname: postAction.qname, message } );
                    await redisSetter.setActionsData( message, JSON.stringify( mock ) );
                    await broadcastOperations.postBroadcaster( 10, 10 );
                } );
                it( 'should not delete message from queue if it not posted', async () => {
                    const { result } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: postAction.qname } );

                    expect( result.message ).to.eq( message );
                } );
                it( 'should not delete post data from redis if it not posted', async () => {
                    const { result } = await redisGetter.getAllHashData( message );

                    expect( JSON.parse( result ) ).to.deep.eq( mock );
                } );
            } );
        } );

    } );
    describe( 'On commentBroadcaster', async () => {
        describe( 'On success', async () => {
            let mock, message;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( 'OK' ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( 'OK' ) );
                mock = postMock( { parentAuthor: getRandomString( 10 ) } );
                message = getRandomString( 15 );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: commentAction.qname } );
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: commentAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mock ) );
            } );
            afterEach( async () => {
                sinon.restore();
            } );
            it( 'should successfully send comment with options with valid data to chain', async () => {
                await broadcastOperations.commentBroadcaster( 10 );
                expect( dsteemModel.postWithOptions.calledOnce ).to.true;
            } );
            it( 'should successfully send comment with valid data to chain', async () => {
                mock.comment_options = {};
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: commentAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mock ) );
                await broadcastOperations.commentBroadcaster( 10 );

                expect( dsteemModel.post.calledOnce ).to.true;
            } );
            it( 'should delete message from queue after posting ', async () => {
                await broadcastOperations.commentBroadcaster( 10 );
                const { error } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: commentAction.qname } );

                expect( error.message ).to.eq( 'No messages' );
            } );
            it( 'should delete comment data from redis after posting', async () => {
                await broadcastOperations.commentBroadcaster( 10 );
                const { result } = await redisGetter.getAllHashData( message );

                expect( result ).to.null;
            } );
            it( 'should broadcasting comment method will called with valid params', async () => {
                mock.comment_options = {};
                await redisQueue.sendMessage( { client: actionsRsmqClient, qname: commentAction.qname, message } );
                await redisSetter.setActionsData( message, JSON.stringify( mock ) );
                await broadcastOperations.commentBroadcaster( 10, 10 );
                mock.body += `\n This message was written by guest ${mock.author}, and is available at waivio.com/@${mock.author}/${mock.permlink}`;
                expect( dsteemModel.post.calledWith( _.omit( mock, [ 'comment_options' ] ), accountsData[ 0 ].postingKey ) ).to.true;
            } );
        } );
        describe( 'On errors', async() => {
            let mock, message;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'post' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } } ) );
                await redisQueue.createQueue( { client: actionsRsmqClient, qname: commentAction.qname } );
                sinon.spy( console, 'log' );
            } );
            afterEach( async () => {
                sinon.restore();
            } );
            describe( 'Empty queue', async () => {
                beforeEach( async () => {
                    await broadcastOperations.commentBroadcaster( 10 );
                } );
                it( 'should returns and write log if queue will be empty', async () => {
                    expect( console.log.calledWith( 'No messages' ) );
                } );
                it( 'should successfully returns if queue is empty', async () => {
                    expect( dsteemModel.postWithOptions.notCalled ).to.true;
                } );
            } );
            describe( 'switcher errors', async() => {
                beforeEach( async() => {
                    message = getRandomString( 10 );
                    mock = postMock( { parentAuthor: getRandomString( 10 ) } );
                    await redisQueue.sendMessage( { client: actionsRsmqClient, qname: commentAction.qname, message } );
                    await redisSetter.setActionsData( message, JSON.stringify( mock ) );
                    await broadcastOperations.commentBroadcaster( 10 );
                } );
                it( 'should not delete message from queue if it not posted', async () => {
                    const { result } = await redisQueue.receiveMessage( { client: actionsRsmqClient, qname: commentAction.qname } );

                    expect( result.message ).to.eq( message );
                } );
                it( 'should not delete post data from redis if it not posted', async () => {
                    const { result } = await redisGetter.getAllHashData( message );

                    expect( JSON.parse( result ) ).to.deep.eq( mock );
                } );
            } );
        } );
    } );
} );
