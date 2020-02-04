const { getNamespace } = require('cls-hooked');

const metadataModify = (jsonMetadata) => {
  let metadata;
  const session = getNamespace('request-session');
  const authorisedUser = session.get('authorised_user');

  try {
    metadata = JSON.parse(jsonMetadata);
  } catch (error) {
    return { error };
  }
  metadata.comment = {
    userId: authorisedUser.name,
    social: authorisedUser.auth.provider,
  };
  return JSON.stringify(metadata);
};

const parseMetadata = (jsonMetadata, next) => {
  try {
    return JSON.parse(jsonMetadata);
  } catch (e) {
    const error = { status: 422, message: e.message };

    return next(error);
  }
};

module.exports = { metadataModify, parseMetadata };
