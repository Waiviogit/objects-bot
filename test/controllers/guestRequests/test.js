const axios = require('axios');
const _ = require('lodash');
const {
  expect, chai, sinon, faker, getRandomString,
  redisQueue, redisSetter, updateMetadata, dsteemModel, redis, authoriseUser, serviceBotsHelper,
} = require('test/testHelper');
const {
  postMock, userMock, botMock, customJsonMock,
} = require('test/mocks');
const { actionTypes } = require('constants/index');
const app = require('app');

describe('On guestRequestsController', async () => {
  describe('On proxyPosting', async () => {
    beforeEach(async () => {
      await redis.actionsDataClient.flushdbAsync();
      sinon.stub(updateMetadata, 'metadataModify').returns('test metadata');
      sinon.stub(serviceBotsHelper, 'setEnvData').returns(Promise.resolve(botMock));
    });
    afterEach(async () => {
      await redis.actionsDataClient.flushdbAsync();
      sinon.restore();
    });
    describe('On proxyPosting comment OK', async () => {
      let author, result;

      beforeEach(async () => {
        author = faker.name.firstName();
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
        result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock({ author, parentAuthor: getRandomString() }));
      });
      it('should return status 200', async () => {
        expect(result).to.have.status(200);
      });
      it('should return correct waiting time for posting', async () => {
        expect(result.body.json.waitingTime).to.be.eq(0);
      });
    });
    describe('On proxyPosting post OK', async () => {
      let author, result;

      beforeEach(async () => {
        author = faker.name.firstName();
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
        result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock({ author, parentAuthor: '' }));
      });
      it('should return status 200', async () => {
        expect(result).to.have.status(200);
      });
      it('should return correct waiting time for posting', async () => {
        expect(result.body.json.waitingTime).to.be.eq(Math.ceil(0));
      });
    });
    describe('On validation error', async () => {
      let author, result;

      beforeEach(async () => {
        sinon.spy(authoriseUser, 'authorise');
        author = faker.name.firstName();
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
        result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock({ author: 5, parentAuthor: '' }));
      });
      afterEach(() => {
        sinon.restore();
      });
      it('should return status 422 if data validation failed', async () => {
        expect(result).to.have.status(422);
      });
      it('should not called authorise method', async () => {
        expect(authoriseUser.authorise).to.be.not.called;
      });
    });
    describe('On validation options errors', async () => {
      let author, result;

      beforeEach(async () => {
        sinon.spy(authoriseUser, 'authorise');
        author = faker.name.firstName();
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
        result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock({ votes: getRandomString() }));
      });
      it('should return 422 status with incorrect options in request', async () => {
        expect(result).to.have.status(422);
      });
      it('should return correct message in error', async () => {
        expect(result.body.message).to.be.eq('"allow_votes" must be a boolean');
      });
    });
    describe('On incorrect options errors', async () => {
      let author, result, mock;

      beforeEach(async () => {
        sinon.spy(authoriseUser, 'authorise');
        author = faker.name.firstName();
        mock = postMock();
        mock.data.operations[1] = [];
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
        result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(mock);
      });
      it('should return 422 status with incorrect options in request', async () => {
        expect(result).to.have.status(422);
      });
      it('should return correct message in error', async () => {
        expect(result.body.message).to.be.eq('"value" is required');
      });
    });
    describe('On incorrect request errors', async () => {
      let author, result, mock;

      beforeEach(async () => {
        sinon.spy(authoriseUser, 'authorise');
        author = faker.name.firstName();
        mock = postMock();
        mock.data.operations[0] = [];
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
        result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(mock);
      });
      it('should return 422 status with incorrect options in request', async () => {
        expect(result).to.have.status(422);
      });
      it('should return correct message in error', async () => {
        expect(result.body.message).to.be.eq('Invalid options in request');
      });
    });
    describe('On proxyPosting errors', async () => {
      it('should return status 401 without valid token', async () => {
        const result = await chai.request(app)
          .post('/guest-create-comment')
          .send(postMock());

        expect(result).to.have.status(401);
      });
      it('should return 401 status if username from authorisation request and author name not same', async () => {
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock()));
        const result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock());

        expect(result).to.have.status(401);
      });
      it('should return 401 status if validation request get error', async () => {
        sinon.stub(axios, 'post').returns(Promise.resolve({ error: 'test error' }));
        const result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock());

        expect(result).to.have.status(401);
      });
    });
    describe('creating post errors', async () => {
      let author;

      beforeEach(async () => {
        author = faker.name.firstName();
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
      });
      afterEach(() => {
        sinon.restore();
      });
      it('should return status 500 with error with creating queue', async () => {
        sinon.stub(redisQueue, 'createQueue').returns(Promise.resolve({ error: 'test error' }));
        const result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock({ author, parentAuthor: getRandomString() }));

        expect(result).to.have.status(500);
      });
      it('should return status 500 with adding to queue redis error ', async () => {
        sinon.stub(redisSetter, 'setActionsData').returns(Promise.resolve({ error: 'test error' }));
        const result = await chai.request(app)
          .post('/guest-create-comment')
          .set({ 'waivio-auth': 1 })
          .send(postMock({ author, parentAuthor: getRandomString() }));

        expect(result).to.have.status(503);
      });
    });
  });
  describe('On proxyCustomJson', async () => {
    let bot, author;

    beforeEach(async () => {
      await redis.actionsDataClient.flushdbAsync();
      author = faker.name.firstName();
      bot = botMock;
      sinon.stub(serviceBotsHelper, 'setEnvData').returns(Promise.resolve(botMock));
    });
    describe('On success', async () => {
      beforeEach(async () => {
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
        sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
      });
      afterEach(async () => {
        sinon.restore();
      });
      describe('On vote', async () => {
        let mock, result;

        beforeEach(async () => {
          mock = customJsonMock.vote({ voter: author });
          result = await chai.request(app)
            .post('/guest-custom-json')
            .set({ 'waivio-auth': 1 })
            .send(mock);
        });
        it('should return status 200 with valid params in vote request', async () => {
          expect(result).to.have.status(200);
        });
        it('should call dsteem method with valid params', async () => {
          expect(dsteemModel.customJSON).to.be.calledWith({
            id: actionTypes.GUEST_VOTE,
            json: JSON.stringify(mock.data.operations[0][1]),
          }, bot.proxyBots[1]);
        });
      });
      describe('On reblog', async () => {
        let mock, result;

        beforeEach(async () => {
          mock = customJsonMock.reblog({ account: author });
          result = await chai.request(app)
            .post('/guest-custom-json')
            .set({ 'waivio-auth': 1 })
            .send(mock);
        });
        it('should return status 200 with valid params in reblog request', async () => {
          expect(result).to.have.status(200);
        });
        it('should call dsteem method with valid params', async () => {
          expect(dsteemModel.customJSON).to.be.calledWith({
            id: actionTypes.GUEST_REBLOG,
            json: mock.data.operations[0][1].json,
          }, bot.proxyBots[1]);
        });
      });
      describe('On update account', async () => {
        let mock, result;

        beforeEach(async () => {
          mock = customJsonMock.update({ account: author });
          result = await chai.request(app)
            .post('/guest-custom-json')
            .set({ 'waivio-auth': 1 })
            .send(mock);
        });
        it('should return status 200 with valid params in update request', async () => {
          expect(result).to.have.status(200);
        });
        it('should call dsteem method with valid params', async () => {
          expect(dsteemModel.customJSON).to.be.calledWith({
            id: actionTypes.GUEST_UPDATE_ACCOUNT,
            json: mock.data.operations[0][1].json,
          }, bot.proxyBots[1]);
        });
      });
      describe('On follow wobject', async () => {
        let mock, result;

        beforeEach(async () => {
          mock = customJsonMock.followWobj({ user: author });
          result = await chai.request(app)
            .post('/guest-custom-json')
            .set({ 'waivio-auth': 1 })
            .send(mock);
        });
        it('should return status 200 with valid params follow wobject in request', async () => {
          expect(result).to.have.status(200);
        });
        it('should call dsteem method with valid params', async () => {
          expect(dsteemModel.customJSON).to.be.calledWith({
            id: actionTypes.GUEST_FOLLOW_WOBJECT,
            json: mock.data.operations[0][1].json,
          }, bot.proxyBots[1]);
        });
      });
      describe('On follow user', async () => {
        let mock, result;

        beforeEach(async () => {
          mock = customJsonMock.follow({ follower: author });
          result = await chai.request(app)
            .post('/guest-custom-json')
            .set({ 'waivio-auth': 1 })
            .send(mock);
        });
        it('should return status 200 with valid params follow in request', async () => {
          expect(result).to.have.status(200);
        });
        it('should call dsteem method with valid params', async () => {
          expect(dsteemModel.customJSON).to.be.calledWith({
            id: actionTypes.GUEST_FOLLOW,
            json: mock.data.operations[0][1].json,
          }, bot.proxyBots[1]);
        });
      });
      describe('On create user', async () => {
        let mock, result;

        beforeEach(async () => {
          mock = customJsonMock.create({ name: author });
          result = await chai.request(app)
            .post('/guest-custom-json')
            .set({ 'waivio-auth': 1 })
            .send(mock);
        });
        it('should return status 200 with valid create user params in request', async () => {
          expect(result).to.have.status(200);
        });
        it('should call dsteem method with valid params', async () => {
          expect(dsteemModel.customJSON).to.be.calledWith(
            { id: mock.id, json: JSON.stringify(mock.json) }, bot.proxyBots[1],
          );
        });
      });
    });
    describe('On errors', async () => {
      let result, mock;

      beforeEach(async () => {
        sinon.stub(axios, 'post').returns(Promise.resolve(userMock({ name: author })));
      });
      afterEach(async () => {
        sinon.restore();
      });
      describe('On vote', async () => {
        describe('On validation errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            mock = customJsonMock.vote({ voter: faker.random.number() });
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 422 with not valid data in request', async () => {
            expect(result).to.have.status(422);
          });
          it('should not call dsteem model method if request data not valid', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On authorisation errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            mock = customJsonMock.vote();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return 401 status, if authorisation check return false', async () => {
            expect(result).to.have.status(401);
          });
          it('should not call dsteem model method if authorisation check failed', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On RPC errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL' } }));
            mock = customJsonMock.vote({ voter: author });
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should try to send custom json by account length times', async () => {
            expect(dsteemModel.customJSON).to.be.callCount(botMock.proxyBots.length);
          });
          it('should return error status 500', async () => {
            expect(result).to.have.status(500);
          });
        });
        describe('On broadcast errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.vote({ voter: author });
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'test error' } }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 500 if broadcast to chain method get error', async () => {
            expect(result).to.have.status(500);
          });
          it('should called broadcast method once', async () => {
            expect(dsteemModel.customJSON).to.be.calledOnce;
          });
          it('should return message from broadcast error', async () => {
            expect(result.body.message).to.be.eq('test error');
          });
        });
      });
      describe('On user follow', async () => {
        describe('On validation errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.follow();
            mock.data.operations = [];
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 422 with not valid data in request', async () => {
            expect(result).to.have.status(422);
          });
          it('should not call dsteem model method if request data not valid', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On RPC errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL' } }));
            mock = customJsonMock.follow({ follower: author });
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should try to send custom json by account length times', async () => {
            expect(dsteemModel.customJSON).to.be.callCount(botMock.proxyBots.length);
          });
          it('should return error status 500', async () => {
            expect(result).to.have.status(500);
          });
        });
        describe('On authorisation errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            mock = customJsonMock.follow();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return 401 status, if authorisation check return false', async () => {
            expect(result).to.have.status(401);
          });
          it('should not call dsteem model method if authorisation check failed', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On broadcast errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.follow({ follower: author });
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'test error' } }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 500 if broadcast to chain method get error', async () => {
            expect(result).to.have.status(500);
          });
          it('should called broadcast method once', async () => {
            expect(dsteemModel.customJSON).to.be.calledOnce;
          });
          it('should return message from broadcast error', async () => {
            expect(result.body.message).to.be.eq('test error');
          });
        });
      });
      describe('On reblog', async () => {
        describe('On validation errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.reblog();
            mock.data.operations = [];
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 422 with not valid data in request', async () => {
            expect(result).to.have.status(422);
          });
          it('should not call dsteem model method if request data not valid', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On RPC errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL' } }));
            mock = customJsonMock.reblog({ account: author });
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should try to send custom json by account length times', async () => {
            expect(dsteemModel.customJSON).to.be.callCount(botMock.proxyBots.length);
          });
          it('should return error status 500', async () => {
            expect(result).to.have.status(500);
          });
        });
        describe('On authorisation errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            mock = customJsonMock.reblog();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return 401 status, if authorisation check return false', async () => {
            expect(result).to.have.status(401);
          });
          it('should not call dsteem model method if authorisation check failed', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On broadcast errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.reblog({ account: author });
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'test error' } }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 500 if broadcast to chain method get error', async () => {
            expect(result).to.have.status(500);
          });
          it('should called broadcast method once', async () => {
            expect(dsteemModel.customJSON).to.be.calledOnce;
          });
          it('should return message from broadcast error', async () => {
            expect(result.body.message).to.be.eq('test error');
          });
        });
      });
      describe('On update account', async () => {
        describe('On validation errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.update();
            mock.data.operations = [];
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 422 with not valid data in request', async () => {
            expect(result).to.have.status(422);
          });
          it('should not call dsteem model method if request data not valid', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On RPC errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL' } }));
            mock = customJsonMock.update({ account: author });
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should try to send custom json by account length times', async () => {
            expect(dsteemModel.customJSON).to.be.callCount(botMock.proxyBots.length);
          });
          it('should return error status 500', async () => {
            expect(result).to.have.status(500);
          });
        });
        describe('On authorisation errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            mock = customJsonMock.update();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return 401 status, if authorisation check return false', async () => {
            expect(result).to.have.status(401);
          });
          it('should not call dsteem model method if authorisation check failed', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On broadcast errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.update({ account: author });
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'test error' } }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 500 if broadcast to chain method get error', async () => {
            expect(result).to.have.status(500);
          });
          it('should called broadcast method once', async () => {
            expect(dsteemModel.customJSON).to.be.calledOnce;
          });
          it('should return message from broadcast error', async () => {
            expect(result.body.message).to.be.eq('test error');
          });
        });
      });
      describe('On wobject follow', async () => {
        describe('On validation errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.followWobj({ user: faker.random.number() });
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 422 with not valid data in request', async () => {
            expect(result).to.have.status(422);
          });
          it('should not call dsteem model method if request data not valid', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On RPC errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL' } }));
            mock = customJsonMock.followWobj({ user: author });
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should try to send custom json by account length times', async () => {
            expect(dsteemModel.customJSON).to.be.callCount(botMock.proxyBots.length);
          });
          it('should return error status 500', async () => {
            expect(result).to.have.status(500);
          });
        });
        describe('On authorisation errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            mock = customJsonMock.followWobj();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return 401 status, if authorisation check return false', async () => {
            expect(result).to.have.status(401);
          });
          it('should not call dsteem model method if authorisation check failed', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On broadcast errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.followWobj({ user: author });
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'test error' } }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 500 if broadcast to chain method get error', async () => {
            expect(result).to.have.status(500);
          });
          it('should called broadcast method once', async () => {
            expect(dsteemModel.customJSON).to.be.calledOnce;
          });
          it('should return message from broadcast error', async () => {
            expect(result.body.message).to.be.eq('test error');
          });
        });
      });
      describe('On create user', async () => {
        describe('On validation errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.create();
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(_.omit(mock.json, ['json_metadata']));
          });
          it('should return status 422 with not valid data in request', async () => {
            expect(result).to.have.status(422);
          });
          it('should not call dsteem model method if request data not valid', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On authorisation errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
            mock = customJsonMock.create();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return 401 status, if authorisation check return false', async () => {
            expect(result).to.have.status(401);
          });
          it('should not call dsteem model method if authorisation check failed', async () => {
            expect(dsteemModel.customJSON).to.be.not.called;
          });
        });
        describe('On RPC errors', async () => {
          beforeEach(async () => {
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL' } }));
            mock = customJsonMock.create({ name: author });
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should try to send custom json by account length times', async () => {
            expect(dsteemModel.customJSON).to.be.callCount(botMock.proxyBots.length);
          });
          it('should return error status 500', async () => {
            expect(result).to.have.status(500);
          });
        });
        describe('On broadcast errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.create({ name: author });
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ error: { message: 'test error' } }));
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(mock);
          });
          it('should return status 500 if broadcast method get error', async () => {
            expect(result).to.have.status(500);
          });
          it('should called broadcast method once', async () => {
            expect(dsteemModel.customJSON).to.be.calledOnce;
          });
          it('should return message from broadcast error', async () => {
            expect(result.body.message).to.be.eq('test error');
          });
        });
        describe('On another errors', async () => {
          beforeEach(async () => {
            mock = customJsonMock.create();
            sinon.stub(dsteemModel, 'customJSON').returns(Promise.resolve({ result: 'OK' }));
          });
          it('should return status 422 if in request no json', async () => {
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(_.omit(mock, ['json']));
            expect(result).to.have.status(422);
          });
          it('should return 422 if request has wrong id', async () => {
            mock.id = faker.random.string();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(_.omit(mock, ['json']));
            expect(result).to.have.status(422);
          });
          it('should return error with correct message if request has wrong id', async () => {
            mock.id = faker.random.string();
            result = await chai.request(app)
              .post('/guest-custom-json')
              .set({ 'waivio-auth': 1 })
              .send(_.omit(mock, ['json']));
            expect(result.body.message).to.be.eq('Invalid request data');
          });
        });
      });
    });
  });
});
