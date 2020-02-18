const { getRandomString, faker } = require('../testHelper');

module.exports = {
  serviceBots: [
    { name: faker.name.firstName(), postingKey: getRandomString(10) },
    { name: faker.name.firstName(), postingKey: getRandomString(10) },
  ],
  proxyBots: [
    { name: faker.name.firstName(), postingKey: getRandomString(10) },
    { name: faker.name.firstName(), postingKey: getRandomString(10) },
  ],

};
