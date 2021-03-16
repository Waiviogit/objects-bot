const _ = require('lodash');
const {
  getRandomString, redisGetter, sinon, redisQueue, serviceBotsHelper,
  actionsRsmqClient, redisSetter, broadcastOperations,
  expect, validationHelper, redis,
} = require('test/testHelper');
const { hiveOperations } = require('utilities/hiveApi');
const { commentAction } = require('constants/guestRequestsData');
const { postMock, botMock } = require('test/mocks');

describe('On broadcastOperations', async () => {
  beforeEach(async () => {
    await redis.actionsDataClient.flushdbAsync();
    sinon.stub(serviceBotsHelper, 'setEnvData').returns(Promise.resolve(botMock));
  });
  afterEach(async () => {
    sinon.restore();
    await redis.actionsDataClient.flushdbAsync();
  });
  describe('On commentBroadcaster', async () => {
    describe('On success', async () => {
      let mock, message, mockPostData;

      beforeEach(async () => {
        sinon.stub(hiveOperations, 'post').returns(Promise.resolve({ result: 'OK' }));
        sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ result: 'OK' }));
        mock = postMock({ parentAuthor: getRandomString(10) });
        mockPostData = validationHelper.postingValidator(mock);
        message = getRandomString(15);
        await redisQueue.createQueue({ client: actionsRsmqClient, qname: commentAction.qname });
        await redisQueue.sendMessage(
          { client: actionsRsmqClient, qname: commentAction.qname, message },
        );
        await redisSetter.setActionsData(message, JSON.stringify(mockPostData));
      });
      it('should successfully send comment with options with valid data to chain', async () => {
        await broadcastOperations.commentBroadcaster({
          noMessageWait: 10,
          path: 'guest_comment',
          qname: commentAction.qname,
          botType: 'proxyBots',
        });
        expect(hiveOperations.postWithOptions).to.be.calledOnce;
      });
      it('should successfully send comment with valid data to chain', async () => {
        await redisQueue.sendMessage(
          { client: actionsRsmqClient, qname: commentAction.qname, message },
        );
        await redisSetter.setActionsData(message, JSON.stringify(_.omit(mockPostData, 'options')));
        await broadcastOperations.commentBroadcaster({
          noMessageWait: 10,
          path: 'guest_comment',
          qname: commentAction.qname,
          botType: 'proxyBots',
        });
        expect(hiveOperations.post).to.be.calledOnce;
      });
      it('should delete message from queue after posting ', async () => {
        await broadcastOperations.commentBroadcaster({
          noMessageWait: 10,
          path: 'guest_comment',
          qname: commentAction.qname,
          botType: 'proxyBots',
        });
        const { error } = await redisQueue.receiveMessage({
          client: actionsRsmqClient,
          qname: commentAction.qname,
        });
        expect(error.message).to.be.eq('No messages');
      });
      it('should delete comment data from redis after posting', async () => {
        await broadcastOperations.commentBroadcaster({
          noMessageWait: 10,
          path: 'guest_comment',
          qname: commentAction.qname,
          botType: 'proxyBots',
        });
        const { result } = await redisGetter.getAllHashData(message);
        expect(result).to.be.null;
      });
    });
    describe('On errors', async () => {
      let mock, message, mockPostData;

      beforeEach(async () => {
        sinon.stub(hiveOperations, 'post').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } }));
        sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { message: 'STEEM_MIN_ROOT_COMMENT_INTERVAL | RC.' } }));
        await redisQueue.createQueue({ client: actionsRsmqClient, qname: commentAction.qname });
        sinon.spy(console, 'error');
      });
      describe('Empty queue', async () => {
        beforeEach(async () => {
          await broadcastOperations.commentBroadcaster({
            noMessageWait: 10,
            path: 'guest_comment',
            qname: commentAction.qname,
          });
        });
        it('should successfully returns if queue is empty', async () => {
          expect(hiveOperations.postWithOptions).to.be.not.called;
        });
      });
      describe('switcher errors', async () => {
        beforeEach(async () => {
          message = getRandomString(10);
          mock = postMock({ parentAuthor: getRandomString(10) });
          mockPostData = validationHelper.postingValidator(mock);
          await redisQueue.sendMessage(
            { client: actionsRsmqClient, qname: commentAction.qname, message },
          );
          await redisSetter.setActionsData(message, JSON.stringify(mockPostData));
          await broadcastOperations.commentBroadcaster({
            noMessageWait: 10,
            path: 'guest_comment',
            qname: commentAction.qname,
            postingErrorWait: 10,
            botType: 'proxyBots',
          });
        });
        it('should not delete message from queue if it not posted', async () => {
          const { result } = await redisQueue.receiveMessage({
            client: actionsRsmqClient,
            qname: commentAction.qname,
          });
          expect(result.message).to.be.eq(message);
        });
        it('should not delete post data from redis if it not posted', async () => {
          const { result } = await redisGetter.getAllHashData(message);
          expect(JSON.parse(result)).to.be.deep.eq(mockPostData);
        });
      });
    });
    describe('On another error', async () => {
      let mock, message, mockPostData;
      beforeEach(async () => {
        sinon.stub(hiveOperations, 'post').returns(Promise.resolve({ error: { message: 'another error' } }));
        sinon.stub(hiveOperations, 'postWithOptions').returns(Promise.resolve({ error: { message: 'another error' } }));
        await redisQueue.createQueue({ client: actionsRsmqClient, qname: commentAction.qname });
        message = getRandomString(10);
        mock = postMock({ parentAuthor: getRandomString(10) });
        mockPostData = validationHelper.postingValidator(mock);
        await redisQueue.sendMessage(
          { client: actionsRsmqClient, qname: commentAction.qname, message },
        );
        await redisSetter.setActionsData(message, JSON.stringify(mockPostData));
        await broadcastOperations.commentBroadcaster({
          noMessageWait: 10,
          path: 'guest_comment',
          qname: commentAction.qname,
          postingErrorWait: 10,
          botType: 'proxyBots',
        });
      });
      it('should delete data if excepted unknown error', async () => {
        const { result } = await redisGetter.getAllHashData(message);
        expect(result).to.be.null;
      });
      it('should delete message if excepted unknown error', async () => {
        const { error } = await redisQueue.receiveMessage({
          client: actionsRsmqClient,
          qname: commentAction.qname,
        });
        expect(error).to.exist;
      });
    });
  });
});
