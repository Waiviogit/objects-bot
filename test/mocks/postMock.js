const { getRandomString } = require('test/testHelper');

module.exports = ({
  author, permlink, parentAuthor, title, metadata, beneficiaries, votes,
} = {}) => ({
  id: 'comment',
  data: {
    operations: [
      [
        'comment',
        {
          parent_author: parentAuthor || '',
          parent_permlink: 'waiviodev',
          author: author || 'burukin',
          permlink: permlink || 'some-post',
          title: title || 'Some post',
          body: getRandomString(20),
          json_metadata: metadata || '{"community":"waiviodev","app":"waiviodev/1.0.0","format":"markdown","tags":["palnet"],"users":[],"links":["https://www.waivio.com/object/sommer"],"image":["https://waivio.nyc3.digitaloceanspaces.com/1576238292_393af10f-99f5-4c86-b895-a1368c2d249f"],"wobj":{"wobjects":[{"objectName":"sommer","author_permlink":"sommer","percent":100}]}}',
        },
      ],
      [
        'comment_options',
        {
          author: 'burukin',
          permlink: 'some-post',
          allow_votes: votes || true,
          allow_curation_rewards: true,
          max_accepted_payout: '1000000.000 SBD',
          percent_steem_dollars: 10000,
          extensions: [
            [
              0,
              {
                beneficiaries: [
                  {
                    account: beneficiaries || 'waivio',
                    weight: 1000,
                  },
                ],
              },
            ],
          ],
        },
      ],
    ],
  },
});
