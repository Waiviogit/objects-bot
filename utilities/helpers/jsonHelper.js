exports.parseJson = (json, errorValue = {}) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return errorValue;
  }
};
