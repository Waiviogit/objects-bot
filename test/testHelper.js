const sinon = require( 'sinon' );
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const expect = chai.expect;
const app = require( '../app' );
const { mockRequest, mockResponse } = require( 'mock-req-res' );
const { redis, redisGetter, redisSetter, redisHelper } = require( '../utilities/redis' );
const { redisQueue, actionsRsmqClient } = require( '../utilities/redis/rsmq' );
const faker = require( 'faker' );
const autoriseUser = require( '../utilities/authorazation/autoriseUser' );
const { postHelper, commentHelper } = require( '../helpers' );

const getRandomString = ( length = 5 ) => {
    return faker.internet.password( length, false, /[a-z]/ );
};

module.exports = {
    sinon,
    chai,
    chaiHttp,
    expect,
    app,
    mockRequest,
    mockResponse,
    redis,
    redisHelper,
    redisGetter,
    redisSetter,
    faker,
    getRandomString,
    redisQueue,
    autoriseUser,
    postHelper,
    commentHelper,
    actionsRsmqClient
};