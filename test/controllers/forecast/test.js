const {
  expect, chai, sinon, redis, serviceBotsHelper,
} = require('test/testHelper');
const { forecastMock, botMock } = require('test/mocks');
const app = require('app');
const { hiveOperations } = require('utilities/hiveApi');

describe('On forecast controller', async () => {
  let mock;

  beforeEach(async () => {
    sinon.stub(serviceBotsHelper, 'setEnvData').returns(Promise.resolve(botMock));
    await redis.actionsDataClient.flushdbAsync();
    mock = forecastMock();
  });
  afterEach(async () => {
    await redis.actionsDataClient.flushdbAsync();
    sinon.restore();
  });
  describe('On markForecastAsExpired', async () => {
    describe('On success', async () => {
      let result;

      beforeEach(async () => {
        sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
        result = await chai.request(app).post('/set-expired').send(mock);
      });
      it('should return status 200', async () => {
        expect(result).to.have.status(200);
      });
      it('should return correct json in response', async () => {
        expect(result.body).to.be.deep.eq({ permlink: `exp-${mock.expForecast.expiredAt}`, author: botMock.serviceBots[0].name });
      });
    });
    describe('On errors', async () => {
      describe('On RPCError', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { name: 'RPCError', message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL RC' } }));
          result = await chai.request(app).post('/set-expired').send(mock);
        });
        afterEach(async () => {
          sinon.restore();
        });
        it('should return status 503 with RPError', async () => {
          expect(result).to.have.status(503);
        });
        it('should try to send comment to chain by all bots', async () => {
          expect(hiveOperations.postWithOptions.callCount)
            .to.be.eq(botMock.serviceBots.length);
        });
      });
      describe('On another errors', async () => {
        let result;

        beforeEach(async () => {
          sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { status: 422 } }));
          result = await chai.request(app).post('/set-expired').send(mock);
        });
        afterEach(async () => {
          sinon.restore();
        });
        it('should return status 422 with not RPCError', async () => {
          expect(result).to.have.status(422);
        });
        it('should not try to send comment to chain by all bots with not RPCError', async () => {
          expect(hiveOperations.postWithOptions).to.be.calledOnce;
        });
      });
    });
  });
});
