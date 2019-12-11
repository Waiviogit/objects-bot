const { chaiHttp, chai, app, sinon, autoriseUser, faker, redisQueue, actionsRsmqClient, redisHelper } = require( '../../testHelper' );
const { postMock } = require( '../../mocks' );
const { commentAction, postAction } = require( '../../../constants/guestRequestsData' );

chai.use( chaiHttp );
chai.should();
const expect = chai.expect;

describe( 'On proxy-service', async () => {
    describe( 'On processComment', async () => {
        let author;

        beforeEach( async () => {
            author = faker.name.firstName();

            await redisQueue.createQueue( { client: actionsRsmqClient, qname: commentAction.qname } );
            for ( let counter = 0; counter < commentAction.limit ; counter++ ) {
                await redisHelper.addToQueue( { data: 'test', author: author }, commentAction );
            }
        } );
        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return status 200 OK with correct responce from comment helper', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( true ) );
            chai.request( app )
                .post( '/create-comment' )
                .send( postMock() )
                .end( ( err, res ) => {
                    res.should.have.status( 200 );
                    expect( res.body.waitingTime ). to.exist;
                    done();
                } );
        } );
        it( 'should return error if in queue many operations from user', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( true ) );
            chai.request( app )
                .post( '/create-comment' )
                .send( postMock( { author: author } ) )
                .end( ( err, res ) => {
                    res.should.have.status( 422 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
        it( 'should return status 500 if redis couldn\'t create queue', ( done ) => {
            sinon.stub( redisQueue, 'createQueue' ).returns( Promise.resolve( { error: 'test error' } ) );
            chai.request( app )
                .post( '/create-comment' )
                .send( postMock( ) )
                .end( ( err, res ) => {
                    res.should.have.status( 500 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
        it( 'should return status 401 if guest authorise validation failed', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( { error: { status: 401, message: 'not authorise' } } ) );
            chai.request( app )
                .post( '/create-comment' )
                .send( postMock( ) )
                .end( ( err, res ) => {
                    res.should.have.status( 401 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
        it( 'should return status 422 with not valid post data', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( true ) );
            chai.request( app )
                .post( '/create-comment' )
                .send( { data: 'test' } )
                .end( ( err, res ) => {
                    res.should.have.status( 422 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
    } );
    describe( 'On processPost', async() => {
        let author;

        beforeEach( async () => {
            author = faker.name.firstName();

            await redisQueue.createQueue( { client: actionsRsmqClient, qname: postAction.qname } );
            for ( let counter = 0; counter < postAction.limit ; counter++ ) {
                await redisHelper.addToQueue( { data: 'test', author: author }, postAction );
            }
        } );
        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return status 200 OK with correct responce from post helper', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( true ) );
            chai.request( app )
                .post( '/create-post' )
                .send( postMock() )
                .end( ( err, res ) => {
                    res.should.have.status( 200 );
                    expect( res.body.waitingTime ). to.exist;
                    done();
                } );
        } );
        it( 'should return error if in queue many post operations from user', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( true ) );
            chai.request( app )
                .post( '/create-post' )
                .send( postMock( { author: author } ) )
                .end( ( err, res ) => {
                    res.should.have.status( 422 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
        it( 'should return status 500 if redis couldn\'t create queue', ( done ) => {
            sinon.stub( redisQueue, 'createQueue' ).returns( Promise.resolve( { error: 'test error' } ) );
            chai.request( app )
                .post( '/create-post' )
                .send( postMock( ) )
                .end( ( err, res ) => {
                    res.should.have.status( 500 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
        it( 'should return status 401 if guest authorise validation failed', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( { error: { status: 401, message: 'not authorise' } } ) );
            chai.request( app )
                .post( '/create-post' )
                .send( postMock( ) )
                .end( ( err, res ) => {
                    res.should.have.status( 401 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
        it( 'should return status 422 with not valid post data', ( done ) => {
            sinon.stub( autoriseUser, 'authorise' ).returns( Promise.resolve( true ) );
            chai.request( app )
                .post( '/create-post' )
                .send( { data: 'test' } )
                .end( ( err, res ) => {
                    res.should.have.status( 422 );
                    expect( res.body.message ).to.exist;
                    done();
                } );
        } );
    } );
} );
