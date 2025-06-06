const { User } = require('../database').models;

const findOne = async ({ filter, projection, options }) => {
  try {
    const result = await User.findOne(filter, projection, options).lean();
    return { result };
  } catch (error) {
    return { error };
  }
};

const updateOne = async ({ filter, update, options }) => {
  try {
    const result = await User.updateOne(filter, update, options);
    return { result };
  } catch (error) {
    return { error };
  }
};

const setSpamByName = async (name) => updateOne({
  filter: { name }, update: { spamDetected: true },
});

const findOneBlockedByName = async (name) => {
  const { result } = await findOne({
    filter: { name, blocked: true },
    projection: { name: 1 },
  });

  return result;
};

module.exports = {
  findOneBlockedByName,
  setSpamByName,
};
