const { expect, chai, app, sinon, getRandomString, dsteemModel } = require( '../../testHelper' );
const { objectMock } = require( '../../mocks' );
const { basicAccounts } = require( '../../../constants/accountsData' );
const { getOptions, getPostData } = require( '../../../utilities/helpers/postingData' );
const { APPEND_OBJECT, CREATE_OBJECT } = require( '../../../constants/actionTypes' );
const _ = require( 'lodash' );

describe( 'On object controller', async () => {
    afterEach( async () => {
        sinon.restore();
    } );
    describe( 'On createObjectTypeOp', async () => {
        let objectType;

        beforeEach( async () => {
            objectType = getRandomString( 10 );
        } );
        describe( 'On success', async() => {
            let result;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { result: 'OK' } ) );
                result = await chai.request( app ).post( '/create-object-type' ).send( { objectType: objectType } );
            } );
            it( 'should return status 200', async () => {
                expect( result ).to.have.status( 200 );
            } );
            it( 'should return correct json in response', async () => {
                expect( result.body.author ).to.be.eq( basicAccounts[ 1 ].name );
            } );
        } );
        describe( 'On errors', async() => {
            describe( 'On RPCError', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } } ) );
                    result = await chai.request( app ).post( '/create-object-type' ).send( { objectType: objectType } );
                } );
                it( 'should return status 503 with RPError', async () => {
                    expect( result ).to.have.status( 503 );
                } );
                it( 'should try to send comment to chain by all bots', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.callCount( basicAccounts.length );
                } );
            } );
            describe( 'On another errors', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'some error' } } ) );
                    result = await chai.request( app ).post( '/create-object-type' ).send( { objectType: objectType } );
                } );
                it( 'should return status 422 with not RPCError', async () => {
                    expect( result ).to.have.status( 422 );
                } );
                it( 'should not try to send comment to chain by all bots with not RPCError', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.calledOnce;
                } );
            } );
            describe( 'On validation error', async() => {
                let result;

                beforeEach( async () => {
                    result = await chai.request( app ).post( '/create-object-type' ).send( );
                } );
                it( 'should return error status with validation error', async () => {
                    expect( result ).to.have.status( 422 );
                } );
                it( 'should return error message with not enough data', async () => {
                    expect( result.body.message ).to.be.eq( 'Not enough data' );
                } );
            } );
        } );
    } );
    describe( 'On processCreateObject', async () => {
        let mock;

        beforeEach( async () => {
            mock = objectMock();
        } );
        describe( 'On success', async() => {
            let result;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { result: 'OK' } ) );
                result = await chai.request( app ).post( '/create-object' ).send( mock );
            } );
            it( 'should return status 200', async () => {
                expect( result ).to.have.status( 200 );
            } );
            it( 'should return correct json in response', async () => {
                expect( result.body.parentPermlink ).to.be.eq( mock.permlink );
            } );
            it( 'should called post method with valid params', async () => {
                expect( dsteemModel.postWithOptions ).to.calledWith( getPostData( mock, basicAccounts[ 0 ], CREATE_OBJECT ),
                    getOptions( mock, basicAccounts[ 0 ] ), basicAccounts[ 0 ].postingKey );
            } );
        } );
        describe( 'On errors', async() => {
            describe( 'On RPCError', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } } ) );
                    result = await chai.request( app ).post( '/create-object' ).send( mock );
                } );
                it( 'should return status 503 with RPError', async () => {
                    expect( result ).to.have.status( 503 );
                } );
                it( 'should try to send comment to chain by all bots', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.callCount( basicAccounts.length );
                } );
            } );
            describe( 'On another errors', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'some error' } } ) );
                    result = await chai.request( app ).post( '/create-object' ).send( mock );
                } );
                it( 'should return status 422 with not RPCError', async () => {
                    expect( result ).to.have.status( 422 );
                } );
                it( 'should not try to send comment to chain by all bots with not RPCError', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.calledOnce;
                } );
            } );
            describe( 'On validation error', async() => {
                it( 'should return error status 422 with validation error with incorrect extending data in request', async () => {
                    const result = await chai.request( app ).post( '/create-object' ).send( objectMock( { extending: getRandomString() } ) );

                    expect( result ).to.have.status( 422 );
                } );
                it( 'should return error status 422 with validation error with incorrect without author in request', async () => {
                    const errorMOck = objectMock();
                    const result = await chai.request( app ).post( '/create-object' ).send( _.omit( errorMOck, [ 'author' ] ) );

                    expect( result ).to.have.status( 422 );
                } );
            } );
        } );
    } );
    describe( 'On processAppendObject', async () => {
        let mock;

        beforeEach( async () => {
            mock = objectMock();
        } );
        describe( 'On success', async() => {
            let result;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { result: 'OK' } ) );
                result = await chai.request( app ).post( '/append-object' ).send( mock );
            } );
            it( 'should return status 200', async () => {
                expect( result ).to.have.status( 200 );
            } );
            it( 'should return correct json in response', async () => {
                expect( result.body.parentPermlink ).to.eq( mock.parentPermlink );
            } );
            it( 'should called post method with valid params', async () => {
                expect( dsteemModel.postWithOptions ).to.be.calledWith( getPostData( mock, basicAccounts[ 0 ], APPEND_OBJECT ),
                    getOptions( mock, basicAccounts[ 0 ] ), basicAccounts[ 0 ].postingKey ) ;
            } );
        } );
        describe( 'On errors', async() => {
            describe( 'On RPCError', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } } ) );
                    result = await chai.request( app ).post( '/append-object' ).send( mock );
                } );
                it( 'should return status 503 with RPError', async () => {
                    expect( result ).to.have.status( 503 );
                } );
                it( 'should try to send comment to chain by all bots', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.callCount( basicAccounts.length );
                } );
            } );
            describe( 'On another errors', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'some error' } } ) );
                    result = await chai.request( app ).post( '/append-object' ).send( mock );
                } );
                it( 'should return status 422 with not RPCError', async () => {
                    expect( result ).to.have.status( 422 );
                } );
                it( 'should not try to send comment to chain by all bots with not RPCError', async () => {
                    expect( dsteemModel.postWithOptions ).to.be.calledOnce;
                } );
            } );
            describe( 'On validation error', async() => {
                it( 'should return error status 422 with validation error with incorrect author in request', async () => {
                    const result = await chai.request( app ).post( '/append-object' ).send( objectMock( { author: 1 } ) );

                    expect( result ).to.have.status( 422 );
                } );
                it( 'should return error status 422 with validation error with incorrect without author in request', async () => {
                    const errorMOck = objectMock();
                    const result = await chai.request( app ).post( '/append-object' ).send( _.omit( errorMOck, [ 'author' ] ) );

                    expect( result ).to.have.status( 422 );
                } );
            } );
        } );
    } );
} );

