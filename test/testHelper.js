const chai = require('chai');
const faker = require('faker');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const sinonChai = require('sinon-chai');

chai.use(chaiHttp);
chai.use(sinonChai);
const { expect } = chai;
const config = require('config');
const { Mongoose } = require('database');
const { mockRequest, mockResponse } = require('mock-req-res');
const { guestOperationAccounts } = require('constants/accountsData');
const authorise = require('utilities/authorazation/waivioAuth/autorise');
const validationHelper = require('controllers/validators/validationHelper');

faker.random.string = (length = 5) => faker.internet.password(length, false, /[a-z]/);
const getRandomString = (length = 5) => faker.internet.password(length, false, /[a-z]/);

const dropDatabase = async () => {
  const { models } = require('../database');
  for (const model in models) {
    await models[model].deleteMany();
  }
};

module.exports = {
  sinon,
  chai,
  expect,
  mockRequest,
  mockResponse,
  ...require('models'),
  ...require('utilities/redis/rsmq'),
  ...require('utilities/redis'),
  faker,
  getRandomString,
  authorise,
  guestOperationAccounts,
  ...require('utilities'),
  config,
  validationHelper,
  dropDatabase,
  Mongoose,
};
