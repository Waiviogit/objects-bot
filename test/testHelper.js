const sinon = require( 'sinon' );
const chai = require( 'chai' );
const chaiHttp = require( 'chai-http' );
const sinonChai = require( 'sinon-chai' );
chai.use( chaiHttp );
chai.use( sinonChai );
const expect = chai.expect;
const app = require( '../app' );
const { mockRequest, mockResponse } = require( 'mock-req-res' );
const { redis, redisGetter, redisSetter, redisHelper } = require( '../utilities/redis' );
const { redisQueue, actionsRsmqClient } = require( '../utilities/redis/rsmq' );
const faker = require( 'faker' );
const authorise = require( '../utilities/authorazation/waivioAuth/autorise' );
const { dsteemModel } = require( '../models' );
const { guestOperationAccounts } = require( '../constants/accountsData' );
const config = require( '../config' );
const { updateMetadata, broadcastOperations, postingData, queueOperations } = require( '../utilities' );
const validationHelper = require( '../controllers/validators/validationHelper' );
const getRandomString = ( length = 5 ) => {
    return faker.internet.password( length, false, /[a-z]/ );
};

faker.random.string = ( length = 5 ) => {
    return faker.internet.password( length, false, /[a-z]/ );
};

module.exports = {
    sinon,
    chai,
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
    authorise,
    queueOperations,
    actionsRsmqClient,
    dsteemModel,
    broadcastOperations,
    guestOperationAccounts,
    updateMetadata,
    postingData,
    config,
    validationHelper
};
