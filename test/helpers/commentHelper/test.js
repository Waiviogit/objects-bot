const { expect, faker, getRandomString, sinon, autoriseUser, commentHelper, redisGetter, redisQueue } = require( '../../testHelper' );
const { postMock, actionMock } = require( '../../mocks' );

describe( 'On CommentHelper', async () => {
    afterEach( async () => {
        sinon.restore();
    } );
    describe( 'On createComment response', async () => {
        let author, operation;

        beforeEach( async() => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( 'OK' ) );
            author = faker.name.firstName();
            operation = getRandomString();
        } );
        it( 'should successfully return time to create comment', async () => {
            const { result } = await commentHelper.addCommentToQueue(
                postMock( { author: author } ), actionMock( { operation: operation } ) );

            expect( result.waitingTime ).to.eq( 0 );
        } );
        it( 'should add comment to queue ', async () => {
            await commentHelper.addCommentToQueue(
                postMock( { author: author } ), actionMock( { operation: operation } ) );
            const result = await redisGetter.getHashKeysAll( `${operation}:${author}:*` );

            expect( result ).to.not.empty;
        } );
        it( 'should return error with too many comments from user', async () => {
            await commentHelper.addCommentToQueue(
                postMock( { author: author } ), actionMock( { operation: operation, limit: 1 } ) );
            const { error } = await commentHelper.addCommentToQueue(
                postMock( { author: author } ), actionMock( { operation: operation, limit: 1 } ) );

            expect( error ).to.exist;
        } );
        it( 'should return validation error with not valid comment in request', async () => {
            const { error } = await commentHelper.addCommentToQueue( postMock( { author: 1 } ), actionMock() );

            expect( error ).to.exist;
        } );
    } );
    describe( 'On CreateComment reject', async () => {
        it( 'should return error from authorisation', async () => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( { error: 'test error' } ) );
            const { error } = await commentHelper.addCommentToQueue( postMock(), actionMock() );

            expect( error ).to.exist;
        } );
        it( 'should return queue error if redis cant create queue', async () => {
            sinon.stub( redisQueue, 'createQueue' ).returns( Promise.resolve( { error: 'test error' } ) );
            const { error } = await commentHelper.addCommentToQueue( postMock(), actionMock() );

            expect( error ).to.exist;
        } );
    } );
} );
