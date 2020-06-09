const validators = require('controllers/validators');

exports.postingValidator = (reqBody, next) => {
  let options, isReview = false;
  const error = { status: 422, message: 'Invalid options in request' };
  // if request not has comment data return error
  if (!reqBody.data.operations[0][1]) return next(error);
  const comment = validators.validate(
    reqBody.data.operations[0][1], validators.posting.simpleSchema, next,
  );
  if (!comment) return;
  if (reqBody.data.operations[1]) { // if request has comment options, validate it
    options = validators.validate(
      reqBody.data.operations[1][1], validators.posting.optionsSchema, next,
    );
    if (!options) return next(error);
  }
  if (reqBody.guestReview) isReview = true;
  return { comment, options, isReview };
};
