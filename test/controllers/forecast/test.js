const { chaiHttp, chai, app, sinon, dsteemModel } = require( '../../testHelper' );
const { forecastMock } = require( '../../mocks' );
const { basicAccounts } = require( '../../../constants/accountsData' );

chai.use( chaiHttp );
chai.should();
const expect = chai.expect;

describe( 'On forecast controller', async() => {
    let mock;

    beforeEach( async () => {
        mock = forecastMock();
    } );
    afterEach( async () => {
        sinon.restore();
    } );
    describe( 'On markForecastAsExpired', async () => {
        describe( 'On success', async () => {
            let result;

            beforeEach( async () => {
                sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { result: 'OK' } ) );
                result = await chai.request( app ).post( '/set-expired' ).send( mock );
            } );
            it( 'should return status 200', async () => {
                expect( result.status ).to.eq( 200 );
            } );
            it( 'should return correct json in response', async () => {
                expect( result.body ).to.deep.eq( { permlink: `exp-${mock.expForecast.expiredAt}`, author: basicAccounts[ 0 ].name } );
            } );
        } );
        describe( 'On errors', async() => {
            describe( 'On RPCError', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } } ) );
                    result = await chai.request( app ).post( '/set-expired' ).send( mock );
                } );
                afterEach( async () => {
                    sinon.restore();
                } );
                it( 'should return status 503 with RPError', async () => {
                    expect( result.status ).to.eq( 503 );
                } );
                it( 'should try to send comment to chain by all bots', async () => {
                    expect( dsteemModel.postWithOptions.callCount ).to.eq( basicAccounts.length );
                } );
            } );
            describe( 'On another errors', async () => {
                let result;

                beforeEach( async () => {
                    sinon.stub( dsteemModel, 'postWithOptions' ).returns( Promise.resolve( { error: { name: 'some error' } } ) );
                    result = await chai.request( app ).post( '/set-expired' ).send( mock );
                } );
                afterEach( async () => {
                    sinon.restore();
                } );
                it( 'should return status 422 with not RPCError', async () => {
                    expect( result.status ).to.eq( 422 );
                } );
                it( 'should not try to send comment to chain by all bots with not RPCError', async () => {
                    expect( dsteemModel.postWithOptions.calledOnce ).to.true;
                } );
            } );
        } );
    } );
} );
