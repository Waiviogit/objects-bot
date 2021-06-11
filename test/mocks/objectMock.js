const { faker, getRandomString } = require('test/testHelper');
const { OBJECT_TYPES } = require('constants/wobjectsData');
const _ = require('lodash');

module.exports = ({
  author, title, permlink, extending, type, rootType,
} = {}) => ({
  author: author || faker.name.firstName(),
  title: title || getRandomString(10),
  body: getRandomString(20),
  permlink: permlink || getRandomString(10),
  objectName: faker.name.firstName(),
  locale: getRandomString(10),
  isExtendingOpen: extending || true,
  isPostingOpen: true,
  parentAuthor: faker.name.firstName(),
  parentPermlink: getRandomString(10),
  type: type || _.sample(Object.values(OBJECT_TYPES)),
  rootType: rootType || {
    author: getRandomString(10),
    permlink: getRandomString(10),
  },
  author_permlink: getRandomString(10),
  field: {
    name: getRandomString(10),
    body: getRandomString(10),
    locale: getRandomString(10),
  },
});
