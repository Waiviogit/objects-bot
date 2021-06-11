const validationHelper = require('controllers/validators/validationHelper');
const authorise = require('utilities/authorazation/waivioAuth/autorise');
const serviceBotsHelper = require('utilities/helpers/serviceBotsHelper');
const { mockRequest, mockResponse } = require('mock-req-res');
const sinonChai = require('sinon-chai');
const chaiHttp = require('chai-http');
const config = require('config');
const faker = require('faker');
const sinon = require('sinon');
const chai = require('chai');
const { expect } = chai;

chai.use(chaiHttp);
chai.use(sinonChai);

faker.random.string = (length = 5) => faker.internet.password(length, false, /[a-z]/);
const getRandomString = (length = 5) => faker.internet.password(length, false, /[a-z]/);

const dropDatabase = async () => {
  const { models } = require('database');
  for (const model in models) {
    await models[model].deleteMany();
  }
};

module.exports = {
  ...require('utilities/redis/rsmq'),
  ...require('utilities/redis'),
  ...require('database').models,
  ...require('utilities'),
  serviceBotsHelper,
  validationHelper,
  getRandomString,
  mockResponse,
  dropDatabase,
  mockRequest,
  authorise,
  expect,
  config,
  sinon,
  faker,
  chai,
};
