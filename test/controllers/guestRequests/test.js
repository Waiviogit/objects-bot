const { chaiHttp, chai, app, sinon, faker, getRandomString, redisQueue, redisSetter } = require( '../../testHelper' );
const { postMock, userMock } = require( '../../mocks' );
const axios = require( 'axios' );
const authoriseUser = require( '../../../utilities/authorazation/authoriseUser' );

chai.use( chaiHttp );
chai.should();
const expect = chai.expect;

describe( 'On guestRequestsController', async () => {

    describe( 'On proxyPosting comment OK', async () => {
        let author, result;

        beforeEach( async ( ) => {
            author = faker.name.firstName();
            sinon.stub( axios, 'post' ).returns( Promise.resolve( userMock( { name: author } ) ) );
            result = await chai.request( app )
                .post( '/create-post' )
                .set( { 'waivio-auth': 1 } )
                .send( postMock( { author: author, parentAuthor: getRandomString() } ) );
        } );
        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return status 200', async () => {
            expect( result.status ).to.eq( 200 );
        } );
        it( 'should return correct waiting time for posting', async () => {
            expect( result.body.waitingTime ).to.eq( 0 );
        } );
    } );
    describe( 'On proxyPosting post OK', async () => {
        let author, result;

        beforeEach( async ( ) => {
            author = faker.name.firstName();
            sinon.stub( axios, 'post' ).returns( Promise.resolve( userMock( { name: author } ) ) );
            result = await chai.request( app )
                .post( '/create-post' )
                .set( { 'waivio-auth': 1 } )
                .send( postMock( { author: author, parentAuthor: '' } ) );
        } );
        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return status 200', async () => {
            expect( result.status ).to.eq( 200 );
        } );
        it( 'should return correct waiting time for posting', async () => {
            expect( result.body.waitingTime ).to.eq( Math.ceil( 5 ) );
        } );
    } );
    describe( 'On validation', async () => {
        let author, result;

        beforeEach( async ( ) => {
            sinon.spy( authoriseUser, 'authorise' );
            author = faker.name.firstName();
            sinon.stub( axios, 'post' ).returns( Promise.resolve( userMock( { name: author } ) ) );
            result = await chai.request( app )
                .post( '/create-post' )
                .set( { 'waivio-auth': 1 } )
                .send( postMock( { author: 5, parentAuthor: '' } ) );
        } );
        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return status 422 if data validation failed', async () => {
            expect( result.status ).to.eq( 422 );
        } );
        it( 'should not called authorise method', async () => {
            expect( authoriseUser.authorise.notCalled ).to.true;
        } );
        it( 'should ', async () => {
            expect( result.body.message ).to.eq( '"author" must be a string' );
        } );
    } );
    describe( 'On proxyPosting errors', async () => {
        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return status 401 without valid token', async () => {
            const result = await chai.request( app )
                .post( '/create-post' )
                .send( postMock( ) );

            expect( result.status ).to.eq( 401 );
        } );
        it( 'should return 401 status if username from authorisation request and author name not same', async () => {
            sinon.stub( axios, 'post' ).returns( Promise.resolve( userMock( ) ) );
            const result = await chai.request( app )
                .post( '/create-post' )
                .set( { 'waivio-auth': 1 } )
                .send( postMock( ) );

            expect( result.status ).to.eq( 401 );
        } );
        it( 'should return 401 status if validation request get error', async () => {
            sinon.stub( axios, 'post' ).returns( Promise.resolve( { error: 'test error' } ) );
            const result = await chai.request( app )
                .post( '/create-post' )
                .set( { 'waivio-auth': 1 } )
                .send( postMock( ) );

            expect( result.status ).to.eq( 401 );
        } );
    } );
    describe( 'creating post errors', async () => {
        let author;

        beforeEach( async () => {
            author = faker.name.firstName();
            sinon.stub( axios, 'post' ).returns( Promise.resolve( userMock( { name: author } ) ) );
        } );
        afterEach( () => {
            sinon.restore();
        } );
        it( 'should return status 500 with error with creating queue', async () => {
            sinon.stub( redisQueue, 'createQueue' ).returns( Promise.resolve( { error: 'test error' } ) );
            const result = await chai.request( app )
                .post( '/create-post' )
                .set( { 'waivio-auth': 1 } )
                .send( postMock( { author: author, parentAuthor: getRandomString() } ) );

            expect( result.status ).to.eq( 500 );
        } );
        it( 'should return status 500 with adding to queue redis error ', async () => {
            sinon.stub( redisSetter, 'setActionsData' ).returns( Promise.resolve( { error: 'test error' } ) );
            const result = await chai.request( app )
                .post( '/create-post' )
                .set( { 'waivio-auth': 1 } )
                .send( postMock( { author: author, parentAuthor: getRandomString() } ) );

            expect( result.status ).to.eq( 500 );
        } );
    } );
} );
