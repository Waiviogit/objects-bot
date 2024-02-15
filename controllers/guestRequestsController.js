const { queueOperations, customJsonOperations } = require('utilities');
const validationHelper = require('controllers/validators/validationHelper');
const authoriseUser = require('utilities/authorazation/authoriseUser');
const commentHelper = require('utilities/helpers/commentHelper');
const { deleteComment } = require('utilities/helpers/deleteCommentHelper');
const transferOperation = require('utilities/operations/transferOperation');
const { withdraw } = require('utilities/operations/guestWithdraw');
const validators = require('./validators');
const { guestMana } = require('../utilities/guestUser');
const { postOrCommentGuest, getManaError } = require('../utilities/helpers/userHelper');

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
    const actionCost = guestMana.MANA_CONSUMPTION[postOrCommentGuest(comment)];
    const validMP = await guestMana.validateMana({
      account: comment.author,
      cost: actionCost,
    });

    if (!validMP) return next(getManaError());
    await guestMana.consumeMana({
      account: comment.author,
      cost: actionCost,
    });

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
  const params = req.body;

  const validMP = await guestMana.validateMana({
    account: params.userName,
    cost: guestMana.MANA_CONSUMPTION.CUSTOM_JSON,
  });

  if (!validMP) return next(getManaError());
  await guestMana.consumeMana({
    account: params.userName,
    cost: guestMana.MANA_CONSUMPTION.CUSTOM_JSON,
  });

  const result = await customJsonOperations.switcher(params, next);

  if (!result) return;
  res.result = { status: 200, json: { json: result } };
  next();
};

const proxyDelete = async (req, res, next) => {
  const value = validators.validate(req.body, validators.deleteComment.dataShcema, next);
  if (!value) return;
  const { result, error } = await deleteComment(value);
  if (error) return next(error);
  if (!result) return;
  res.result = { status: 200, json: result };
  next();
};

const guestTransfer = async (req, res, next) => {
  const value = validators.validate(req.body, validators.guestTransfer.dataShcema, next);
  if (!value) return;
  const { error: authError } = await authoriseUser.authorise(value.account);
  if (authError) return next(authError);

  const { result, error: transferError } = await transferOperation.transfer(value);
  if (transferError) return next(transferError);

  res.result = { status: 200, json: result };
  next();
};

const guestWithdraw = async (req, res, next) => {
  const value = validators.validate(req.body, validators.guestTransfer.withdrawSchema, next);
  if (!value) return;
  const { error: authError } = await authoriseUser.authorise(value.account);
  if (authError) return next(authError);

  const { result, error: transferError } = await withdraw(value);
  if (transferError) return next(transferError);

  res.result = { status: 200, json: result };
  next();
};

module.exports = {
  proxyPosting,
  proxyCustomJson,
  proxyDelete,
  guestTransfer,
  guestWithdraw,
};
