const { faker } = require('test/testHelper');
const { actionTypes } = require('constants/index');

exports.vote = ({ voter, author } = {}) => ({
  id: actionTypes.GUEST_VOTE,
  data: {
    operations: [
      [
        faker.random.string(),
        {
          voter: voter || faker.random.string(),
          author: author || faker.random.string(),
          permlink: faker.random.string(),
          weight: faker.random.number(),
        },
      ],
    ],
  },
});

exports.followWobj = ({ user, permlink } = {}) => ({
  id: actionTypes.GUEST_FOLLOW_WOBJECT,
  data: {
    operations: [
      [
        faker.random.string(),
        {
          json: JSON.stringify([
            'follow',
            {
              user: user || faker.name.firstName(),
              author_permlink: permlink || faker.name.firstName(),
              what: [],
            },
          ]),
        },
      ],
    ],
  },
});

exports.follow = ({ follower, following } = {}) => ({
  id: actionTypes.GUEST_FOLLOW,
  data: {
    operations: [
      [
        faker.random.string(),
        {
          json: JSON.stringify([
            'follow',
            {
              follower: follower || faker.name.firstName(),
              following: following || faker.name.firstName(),
              what: [],
            },
          ]),
        },
      ],
    ],
  },
});

exports.create = ({ name, alias, metadata } = {}) => ({
  id: actionTypes.GUEST_CREATE,
  json: {
    userId: name || faker.name.firstName(),
    displayName: alias || faker.name.firstName(),
    json_metadata: metadata || JSON.stringify({
      profile: {
        name: faker.random.string(),
        about: faker.random.string(),
        location: faker.random.string(),
        profile_image: faker.random.string(),
        bitcoin: faker.random.string(),
        cover_image: faker.random.string(),
        ethereum: faker.random.string(),
        facebook: faker.random.string(),
        github: faker.random.string(),
        instagram: faker.random.string(),
        linkedin: faker.random.string(),
        signature: faker.random.string(),
        twitter: faker.random.string(),
        website: faker.random.string(),
        youtube: faker.random.string(),
      },

    }),
  },
});

exports.reblog = ({ account, author } = {}) => ({
  id: actionTypes.GUEST_REBLOG,
  data: {
    operations: [
      [
        faker.random.string(),
        {
          json: JSON.stringify([
            'reblog',
            {
              account: account || faker.name.firstName(),
              author: author || faker.name.firstName(),
              permlink: faker.random.string(),
            },
          ]),
        },
      ],
    ],
  },
});

exports.update = ({ account } = {}) => ({
  id: actionTypes.GUEST_UPDATE_ACCOUNT,
  data: {
    operations: [
      [
        faker.random.string(),
        {
          id: 'account_update',
          json: JSON.stringify(
            {
              account: account || faker.name.firstName(),
              json_metadata: faker.random.string(),
            },
          ),
        },
      ],
    ],
  },
});
