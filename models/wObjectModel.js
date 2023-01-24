const WObjectModel = require('database').models.WObject;

const findOne = async ({
  filter, projection, options,
}) => {
  try {
    return {
      result: await WObjectModel.findOne(filter, projection, options).lean(),
    };
  } catch (error) {
    return { error };
  }
};

module.exports = {
  findOne,
};
