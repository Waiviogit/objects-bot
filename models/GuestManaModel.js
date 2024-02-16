const { GuestMana } = require('../database').models;

const create = async ({ account, mana }) => {
  try {
    const result = await GuestMana.create({
      account,
      mana,
    });

    return {
      result: result.toObject(),
    };
  } catch (error) {
    return { error };
  }
};

const findOneByName = async (account) => {
  try {
    const result = await GuestMana.findOne({
      account,
    }).lean();

    return {
      result,
    };
  } catch (error) {
    return { error };
  }
};

const updateOneMana = async ({ account, lastManaUpdate, cost }) => {
  try {
    const result = await GuestMana.updateOne({
      account,
    }, {
      $inc: { mana: -cost },
      lastManaUpdate,
    });

    return { result };
  } catch (error) {
    return { error };
  }
};

module.exports = {
  create,
  findOneByName,
  updateOneMana,
};
