const chai = require('chai');
const faker = require('faker');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const sinonChai = require('sinon-chai');

chai.use(chaiHttp);
chai.use(sinonChai);
const { expect } = chai;
const config = require('config');
const { mockRequest, mockResponse } = require('mock-req-res');
const authorise = require('utilities/authorazation/waivioAuth/autorise');
const validationHelper = require('controllers/validators/validationHelper');
const serviceBotsHelper = require('utilities/helpers/serviceBotsHelper');

faker.random.string = (length = 5) => faker.internet.password(length, false, /[a-z]/);
const getRandomString = (length = 5) => faker.internet.password(length, false, /[a-z]/);

module.exports = {
  sinon,
  serviceBotsHelper,
  chai,
  expect,
  mockRequest,
  mockResponse,
  ...require('utilities/redis/rsmq'),
  ...require('utilities/redis'),
  faker,
  getRandomString,
  authorise,
  ...require('utilities'),
  config,
  validationHelper,
};
