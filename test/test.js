const { redis } = require('./testHelper');

beforeEach(async () => {
  process.env.NODE_ENV = 'test';
  await redis.actionsQueueClient.flushdbAsync();
  await redis.actionsDataClient.flushdbAsync();
});
