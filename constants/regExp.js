
const steemErrRegExp = new RegExp( 'STEEM_MIN_ROOT_COMMENT_INTERVAL|RC. Please wait to transact, or power up STEEM|Can only perform one comment edit per block.|trx.ref_block_prefix' );

module.exports = {
    steemErrRegExp
};
