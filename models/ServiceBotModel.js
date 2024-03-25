const { ServiceBot } = require('../database').models;

const getAllServiceBots = async () => {
  try {
    const result = await ServiceBot.aggregate([
      {
        $facet: {
          serviceBots: [
            { $match: { roles: 'serviceBot' } },
          ],
          proxyBots: [
            { $match: { roles: 'proxyBot' } },
          ],
          reviewBots: [
            { $match: { roles: 'reviewBot' } },
          ],

        },
      },
    ]);

    return { result: result[0] };
  } catch (error) {
    return { error };
  }
};

module.exports = {
  getAllServiceBots,
};
