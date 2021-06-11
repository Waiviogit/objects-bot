const { ObjectType, faker } = require('test/testHelper');

exports.Create = async ({
  name, author, permlink, commentsNum,
} = {}) => {
  const data = {
    name: name || faker.random.string(10),
    author: author || faker.name.firstName().toLowerCase(),
    permlink: permlink || faker.random.string(),
    commentsNum: commentsNum || faker.random.number(),
  };

  const objectType = await ObjectType.create(data);

  return objectType.toObject();
};
