const validators = require('controllers/validators');
const sitesHelper = require('utilities/helpers/sitesHelper');
const { CREATE_WEBSITE, DELETE_WEBSITE, SEND_INVOICE } = require('constants/sitesConstants');

exports.sendCreateSite = async (req, res, next) => {
  const value = validators.validate(req.body, validators.sites.createWebsite, next);
  if (!value) return;
  if (req.headers.api_key !== process.env.API_KEY) return next({ status: 401, message: 'unauthorized' });
  const { result, error } = await sitesHelper.websiteActions(value, CREATE_WEBSITE);

  if (error) return next(error);

  res.result = { status: 200, json: { result } };
  next();
};

exports.sendRemoveSite = async (req, res, next) => {
  const value = validators.validate(req.body, validators.sites.deleteWebsite, next);
  if (!value) return;
  if (req.headers.api_key !== process.env.API_KEY) return next({ status: 401, message: 'unauthorized' });
  const { result, error } = await sitesHelper.websiteActions(value, DELETE_WEBSITE);

  if (error) return next(error);

  res.result = { status: 200, json: { result } };
  next();
};

exports.sendInvoice = async (req, res, next) => {
  const value = validators.validate(req.body, validators.sites.sendInvoice, next);
  if (!value) return;
  if (req.headers.api_key !== process.env.API_KEY) return next({ status: 401, message: 'unauthorized' });

  const { result, error } = await sitesHelper.websiteActions(value, SEND_INVOICE);

  if (error) return next(error);

  res.result = { status: 200, json: { result } };
  next();
};
