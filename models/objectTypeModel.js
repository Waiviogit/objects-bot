const { ObjectType } = require('database').models;

exports.find = async (condition, select = {}) => {
  try {
    return { result: await ObjectType.find(condition, select).lean() };
  } catch (error) {
    return { error };
  }
};

exports.findOne = async (condition, select = {}) => {
  try {
    return { result: await ObjectType.findOne(condition, select).lean() };
  } catch (error) {
    return { error };
  }
};
