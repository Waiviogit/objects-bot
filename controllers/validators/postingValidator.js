const Joi = require('joi');

exports.simpleSchema = Joi.object().keys({
  author: Joi.string().required(),
  permlink: Joi.string().required(),
  guest_root_author: Joi.string().default(''),
  post_root_author: Joi.string().default(''),
  parent_author: Joi.string().allow('').default(''),
  title: Joi.when('parent_author', {
    is: '',
    then: Joi.string().invalid('').required(),
    otherwise: Joi.string().allow('').required(),
  }),
  parent_permlink: Joi.string(),
  body: Joi.string().required(),
  json_metadata: Joi.string().required(),
}).required().options({ allowUnknown: true, stripUnknown: true });

exports.optionsSchema = Joi.object().keys({
  author: Joi.string().required(),
  permlink: Joi.string().required(),
  allow_votes: Joi.boolean().required(),
  allow_curation_rewards: Joi.boolean().required(),
  max_accepted_payout: Joi.string().required(),
  percent_steem_dollars: Joi.number().allow(0),
  percent_hive_dollars: Joi.number().allow(0),
  extensions: Joi.array().items(
    Joi.array().ordered(
      Joi.number().allow(0).required(),
      Joi.object().keys({
        beneficiaries: Joi.array().items(
          Joi.object().keys({
            account: Joi.string().required(),
            weight: Joi.number().required(),
          }).required(),
        ).custom((value, helpers) => {
          // Create a Set to track unique accounts
          const accounts = new Set();
          // Iterate over each beneficiary and check for duplicates
          for (const beneficiary of value) {
            if (accounts.has(beneficiary.account)) {
              return helpers.message(`Duplicate account: ${beneficiary.account}`);
            }
            accounts.add(beneficiary.account);
          }
          accounts.clear();

          // If no duplicates were found, return the value
          return value;
        }, 'Unique account validation').required(),
      }).required(),
    ),
  ).required(),
}).required().options({ allowUnknown: true });
