const steemErrRegExp = new RegExp('HIVE_MIN_REPLY_INTERVAL|RC. Please wait to transact, or power up HIVE|HIVE_MIN_ROOT_COMMENT_INTERVAL|STEEM_MIN_ROOT_COMMENT_INTERVAL|RC. Please wait to transact, or power up STEEM|STEEM_MIN_REPLY_INTERVAL|trx.ref_block_prefix|App not found!| App not found!');


module.exports = {
  steemErrRegExp,
};
