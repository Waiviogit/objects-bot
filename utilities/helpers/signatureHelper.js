const { PrivateKey } = require('@hiveio/dhive');
const crypto = require('crypto');
const config = require('config');

const signTransaction = ({ trx = '', privateMemoKey = config.appMemoKey }) => {
  try {
    // instance of private key
    const key = PrivateKey.fromString(privateMemoKey);

    // create hash from transaction
    const hashedMessage = crypto.createHash('sha256').update(trx).digest();

    const signed = key.sign(hashedMessage);

    return signed.toString();
  } catch (error) {
    return '';
  }
};

const signComment = ({ author, permlink }) => {
  const trx = JSON.stringify({ author, permlink });

  return signTransaction({ trx });
};

const signCustomJson = ({ account, id, json }) => {
  const trx = JSON.stringify({ account, id, json });
  return signTransaction({ trx });
};

module.exports = {
  signComment,
  signCustomJson,
};
