const { queueOperations, customJsonOperations } = require('utilities');
const validationHelper = require('controllers/validators/validationHelper');
const authoriseUser = require('utilities/authorazation/authoriseUser');
const commentHelper = require('utilities/helpers/commentHelper');

const proxyPosting = async (req, res, next) => { // add data to queue
  const comment = validationHelper.postingValidator(req.body, next);
  if (!comment) return;

  const { error, isValid } = await authoriseUser.authorise(comment.comment.author);
  if (error) return next(error);
  if (isValid) {
    if (comment.comment.guest_root_author && comment.comment.parent_author !== '') {
      const result = await commentHelper.validateComment(comment.comment, next);
      if (!result) return;
    }
    const {
      result: timeToPublication,
      error: postingError,
    } = await queueOperations.queueSwitcher(comment);

    if (postingError) return next(postingError);

    res.result = { status: 200, json: { json: timeToPublication } };
    next();
  }
};

const proxyCustomJson = async (req, res, next) => {
  const result = await customJsonOperations.switcher(req.body, next);

  if (!result) return;
  res.result = { status: 200, json: { json: result } };
  next();
};


module.exports = {
  proxyPosting,
  proxyCustomJson,
};
