const {
  expect, chai, sinon, getRandomString, redis, serviceBotsHelper, faker,
} = require('test/testHelper');
const { OBJECT_TYPES, MIN_OBJECT_TYPE_COUNT, MAX_COMMENTS } = require('constants/wobjectsData');
const checkUsersForBlackList = require('utilities/helpers/checkUsersForBlackList');
const { getOptions, getPostData } = require('utilities/helpers/postingData');
const { APPEND_OBJECT, CREATE_OBJECT } = require('constants/actionTypes');
const { hiveOperations, hiveClient } = require('utilities/hiveApi');
const requestHelper = require('utilities/helpers/requestHelper');
const { ObjectTypeFactory } = require('test/factories');
const { objectMock, botMock } = require('test/mocks');
const { nodeUrls } = require('constants/appData');
const _ = require('lodash');
const app = require('app');

describe('On object controller', async () => {
  let bots, blackList;
  const type = _.sample(Object.values(OBJECT_TYPES));
  beforeEach(async () => {
    bots = botMock;
    blackList = faker.random.string(10);
    sinon.stub(hiveOperations, 'getAccountRC').returns(Promise.resolve(2000000000000));
    sinon.stub(serviceBotsHelper, 'setEnvData').returns(Promise.resolve(bots));
    sinon.stub(checkUsersForBlackList, 'checkForBlackList').returns(false);
    await redis.actionsDataClient.flushdbAsync();
  });
  afterEach(async () => {
    await redis.actionsDataClient.flushdbAsync();
    sinon.restore();
  });
  describe('On createObjectTypeOp', async () => {
    let objectType;

    beforeEach(async () => {
      objectType = getRandomString(10);
    });
    describe('On success', async () => {
      let result;

      beforeEach(async () => {
        sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
        result = await chai.request(app).post('/create-object-type').send({ objectType });
      });
      it('should return status 200', async () => {
        expect(result).to.have.status(200);
      });
      it('should return correct json in response', async () => {
        expect(result.body.author).to.be.eq(bots.serviceBots[0].name);
      });
    });
    describe('On errors', async () => {
      describe('On RPCError', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
          result = await chai.request(app).post('/create-object-type').send({ objectType });
        });
        it('should return status 503 with RPError', async () => {
          expect(result).to.have.status(503);
        });
        it('should try to send comment to chain by all bots', async () => {
          expect(hiveOperations.postWithOptions)
            .to.be.callCount(bots.serviceBots.length * nodeUrls.length);
        });
      });
      describe('On another errors', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { status: 422 } }));
          result = await chai.request(app).post('/create-object-type').send({ objectType });
        });
        it('should return status 422 with not RPCError', async () => {
          expect(result).to.have.status(422);
        });
        it('should not try to send comment to chain by all bots with not RPCError', async () => {
          expect(hiveOperations.postWithOptions).to.be.calledOnce;
        });
      });
      describe('On validation error', async () => {
        let result;

        beforeEach(async () => {
          result = await chai.request(app).post('/create-object-type').send();
        });
        it('should return error status with validation error', async () => {
          expect(result).to.have.status(422);
        });
        it('should return error message with not enough data', async () => {
          expect(result.body.message).to.be.eq('Not enough data');
        });
      });
    });
  });
  describe('On processCreateObject', async () => {
    let mock;

    beforeEach(async () => {
      for (let i = 0; i < MIN_OBJECT_TYPE_COUNT; i++) {
        await ObjectTypeFactory.Create({ name: type, commentsNum: _.random(0, MAX_COMMENTS - 1) });
      }
      mock = objectMock({ type });
    });

    describe('On success', async () => {
      let result;
      beforeEach(async () => {
        sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
        result = await chai.request(app).post('/create-object').send(mock);
      });
      it('should return status 200', async () => {
        expect(result).to.have.status(200);
      });
      it('should return correct json in response', async () => {
        expect(result.body.parentPermlink).to.be.eq(mock.permlink);
      });
      it('should called post method with valid params', async () => {
        expect(hiveOperations.postWithOptions)
          .to.calledWith(
            hiveClient.client,
            {
              comment: getPostData(mock, bots.serviceBots[1], CREATE_OBJECT),
              options: await getOptions(mock, bots.serviceBots[1]),
              key: bots.serviceBots[1].postingKey,
            },
          );
      });
    });
    describe('On errors', async () => {
      describe('On RPCError', async () => {
        let result;
        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
          result = await chai.request(app).post('/create-object').send(mock);
        });
        it('should return status 503 with RPError', async () => {
          expect(result).to.have.status(503);
        });
        it('should return 422 error if author in blackList', async () => {
          sinon.restore();
          sinon.stub(checkUsersForBlackList, 'checkForBlackList').returns(true);
          mock.author = blackList;
          result = await chai.request(app).post('/create-object').send(mock);
          expect(result).to.have.status(422);
        });
        it('should return error if author in blackList', async () => {
          sinon.restore();
          sinon.stub(checkUsersForBlackList, 'checkForBlackList').returns(true);
          mock.author = blackList;
          result = await chai.request(app).post('/create-object').send(mock);
          expect(result.body.message).to.be.eq('Author in blackList!');
        });
        it('should try to send comment to chain by all bots', async () => {
          expect(hiveOperations.postWithOptions)
            .to.be.callCount(bots.serviceBots.length * nodeUrls.length);
        });
      });
      describe('On another errors', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { status: 422 } }));
          result = await chai.request(app).post('/create-object').send(mock);
        });
        it('should return status 422 with not RPCError', async () => {
          expect(result).to.have.status(422);
        });
        it('should not try to send comment to chain by all bots with not RPCError', async () => {
          expect(hiveOperations.postWithOptions).to.be.calledOnce;
        });
      });
      describe('On validation error', async () => {
        it('should return error status 422 with validation error with incorrect extending data in request', async () => {
          const result = await chai.request(app).post('/create-object').send(objectMock({ extending: getRandomString() }));

          expect(result).to.have.status(422);
        });
        it('should return error status 422 with validation error with incorrect without author in request', async () => {
          const errorMOck = objectMock();
          const result = await chai.request(app).post('/create-object').send(_.omit(errorMOck, ['author']));

          expect(result).to.have.status(422);
        });
      });
    });
  });
  describe('On processAppendObject', async () => {
    let mock;

    beforeEach(async () => {
      const objectType = await ObjectTypeFactory
        .Create({ name: type, commentsNum: _.random(0, MAX_COMMENTS - 1) });
      mock = objectMock({
        type, rootType: { author: objectType.author, permlink: objectType.permlink },
      });
      sinon.stub(requestHelper, 'getUser').returns(Promise.resolve({ user: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
    });
    describe('On success', async () => {
      let result;

      beforeEach(async () => {
        sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
        result = await chai.request(app).post('/append-object').send(mock);
      });
      afterEach(async () => {
        sinon.restore();
      });
      it('should return status 200', async () => {
        expect(result).to.have.status(200);
      });
      it('should return correct json in response', async () => {
        expect(result.body.parentPermlink).to.eq(mock.parentPermlink);
      });
      it('should called post method with valid params', async () => {
        expect(hiveOperations.postWithOptions)
          .to.be.calledWith(
            hiveClient.client,
            {
              comment: getPostData(mock, bots.serviceBots[1], APPEND_OBJECT),
              options: await getOptions(mock, bots.serviceBots[1]),
              key: bots.serviceBots[1].postingKey,
            },
          );
      });
    });
    describe('On errors', async () => {
      describe('On RPCError', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
          result = await chai.request(app).post('/append-object').send(mock);
        });
        it('should return status 503 with RPError', async () => {
          expect(result).to.have.status(503);
        });
        it('should return 422 error if author in blackList', async () => {
          sinon.restore();
          sinon.stub(checkUsersForBlackList, 'checkForBlackList').returns(true);
          mock.author = blackList;
          result = await chai.request(app).post('/append-object').send(mock);
          expect(result).to.have.status(422);
        });
        it('should return error if author in blackList', async () => {
          sinon.restore();
          sinon.stub(checkUsersForBlackList, 'checkForBlackList').returns(true);
          mock.author = blackList;
          result = await chai.request(app).post('/append-object').send(mock);
          expect(result.body.message).to.be.eq('Author in blackList!');
        });
        it('should try to send comment to chain by all bots', async () => {
          expect(hiveOperations.postWithOptions)
            .to.be.callCount(bots.serviceBots.length * nodeUrls.length);
        });
      });
      describe('On another errors', async () => {
        let result;
        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { status: 422 } }));
          result = await chai.request(app).post('/append-object').send(mock);
        });
        it('should return status 422 with not RPCError', async () => {
          expect(result).to.have.status(422);
        });
        it('should not try to send comment to chain by all bots with not RPCError', async () => {
          expect(hiveOperations.postWithOptions).to.be.calledOnce;
        });
      });
      describe('On validation error', async () => {
        it('should return error status 422 with validation error with incorrect author in request', async () => {
          const result = await chai.request(app).post('/append-object').send(objectMock({ author: 1 }));

          expect(result).to.have.status(422);
        });
        it('should return error status 422 with validation error with incorrect without author in request', async () => {
          const errorMOck = objectMock();
          const result = await chai.request(app).post('/append-object').send(_.omit(errorMOck, ['author']));

          expect(result).to.have.status(422);
        });
      });
    });
  });
});
