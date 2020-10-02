const validators = require('controllers/validators');
const sitesHelper = require('utilities/helpers/sitesHelper');

exports.sendCreateSite = async (req, res, next) => {
  const value = validators.validate(req.body, validators.sites.createWebsite, next);
  if (!value) return;
  if (req.headers.api_key !== process.env.API_KEY) return next({ status: 401, message: 'unauthorized' });
  const { result, error } = await sitesHelper.sendCreateWebsite(value);

  if (error) return next(error);

  res.result = { status: 200, json: { result } };
  next();
};
