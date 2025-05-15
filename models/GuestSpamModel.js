const { GuestSpam } = require('../database').models;

const create = async (doc) => {
  try {
    const result = await GuestSpam.create(doc);

    return {
      result,
    };
  } catch (error) {
    return { error };
  }
};

module.exports = {
  create,
};
