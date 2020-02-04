const { getRandomString, faker } = require('test/testHelper');

const date = new Date();

module.exports = ({ body, permlink } = {}) => ({
  author: getRandomString(10),
  title: '',
  body: body || getRandomString(20),
  permlink: permlink || getRandomString(20),
  parentAuthor: getRandomString(10),
  parentPermlink: getRandomString(20),
  expForecast: {
    profitability: faker.random.number(),
    expiredAt: date.valueOf(),
  },
});
