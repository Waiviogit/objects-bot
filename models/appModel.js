const { App } = require('database').models;

exports.findOne = async ({ name }) => {
  try {
    return { app: await App.findOne({ name }).lean() };
  } catch (error) {
    return { error };
  }
};
