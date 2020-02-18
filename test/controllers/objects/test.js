const _ = require('lodash');
const {
  expect, chai, sinon, getRandomString, dsteemModel, redis, addBotsToEnv,
} = require('test/testHelper');
const { objectMock, botMock } = require('test/mocks');
const { getOptions, getPostData } = require('utilities/helpers/postingData');
const { APPEND_OBJECT, CREATE_OBJECT } = require('constants/actionTypes');
const app = require('app');
const requestHelper = require('utilities/helpers/requestHelper');


describe('On object controller', async () => {
  let bots;
  beforeEach(async () => {
    bots = botMock;
    sinon.stub(addBotsToEnv, 'setEnvData').returns(Promise.resolve(bots));
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
        sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
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
          sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
          result = await chai.request(app).post('/create-object-type').send({ objectType });
        });
        it('should return status 503 with RPError', async () => {
          expect(result).to.have.status(503);
        });
        it('should try to send comment to chain by all bots', async () => {
          expect(dsteemModel.postWithOptions).to.be.callCount(bots.serviceBots.length);
        });
      });
      describe('On another errors', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ error: { name: 'some error' } }));
          result = await chai.request(app).post('/create-object-type').send({ objectType });
        });
        it('should return status 422 with not RPCError', async () => {
          expect(result).to.have.status(422);
        });
        it('should not try to send comment to chain by all bots with not RPCError', async () => {
          expect(dsteemModel.postWithOptions).to.be.calledOnce;
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
      mock = objectMock();
      sinon.stub(requestHelper, 'getUser').returns(Promise.resolve({ user: getRandomString() }));
    });
    afterEach(async () => {
      sinon.restore();
    });
    describe('On success', async () => {
      let result;

      beforeEach(async () => {
        sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
        result = await chai.request(app).post('/create-object').send(mock);
      });
      it('should return status 200', async () => {
        expect(result).to.have.status(200);
      });
      it('should return correct json in response', async () => {
        expect(result.body.parentPermlink).to.be.eq(mock.permlink);
      });
      it('should called post method with valid params', async () => {
        expect(dsteemModel.postWithOptions)
          .to.calledWith(getPostData(mock, bots.serviceBots[1], CREATE_OBJECT),
            await getOptions(mock, bots.serviceBots[1]), bots.serviceBots[1].postingKey);
      });
    });
    describe('On errors', async () => {
      describe('On RPCError', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
          result = await chai.request(app).post('/create-object').send(mock);
        });
        it('should return status 503 with RPError', async () => {
          expect(result).to.have.status(503);
        });
        it('should try to send comment to chain by all bots', async () => {
          expect(dsteemModel.postWithOptions).to.be.callCount(bots.serviceBots.length);
        });
      });
      describe('On another errors', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ error: { name: 'some error' } }));
          result = await chai.request(app).post('/create-object').send(mock);
        });
        it('should return status 422 with not RPCError', async () => {
          expect(result).to.have.status(422);
        });
        it('should not try to send comment to chain by all bots with not RPCError', async () => {
          expect(dsteemModel.postWithOptions).to.be.calledOnce;
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
      mock = objectMock();
      sinon.stub(requestHelper, 'getUser').returns(Promise.resolve({ user: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
    });
    describe('On success', async () => {
      let result;

      beforeEach(async () => {
        sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
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
        expect(dsteemModel.postWithOptions)
          .to.be.calledWith(getPostData(mock, bots.serviceBots[1], APPEND_OBJECT),
            await getOptions(mock, bots.serviceBots[1]), bots.serviceBots[1].postingKey);
      });
    });
    describe('On errors', async () => {
      describe('On RPCError', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
          result = await chai.request(app).post('/append-object').send(mock);
        });
        it('should return status 503 with RPError', async () => {
          expect(result).to.have.status(503);
        });
        it('should try to send comment to chain by all bots', async () => {
          expect(dsteemModel.postWithOptions).to.be.callCount(bots.serviceBots.length);
        });
      });
      describe('On another errors', async () => {
        let result;
        beforeEach(async () => {
          sinon.stub(dsteemModel, 'postWithOptions').returns(Promise.resolve({ error: { name: 'some error' } }));
          result = await chai.request(app).post('/append-object').send(mock);
        });
        it('should return status 422 with not RPCError', async () => {
          expect(result).to.have.status(422);
        });
        it('should not try to send comment to chain by all bots with not RPCError', async () => {
          expect(dsteemModel.postWithOptions).to.be.calledOnce;
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
