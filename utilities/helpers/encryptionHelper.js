const crypto = require('crypto');
const { de } = require('faker/lib/locales');

const encryptionKeyEnv = Buffer.from(process.env.BOTS_ENCRYPTION_KEY, 'hex');

// Encrypt the wallet key
const encryptData = ({ data, encryptionKey = encryptionKeyEnv }) => {
  try {
    const iv = crypto.randomBytes(16); // Initialization vector
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
  } catch (error) {
    return { error };
  }
};

// Decrypt the wallet key
const decryptData = ({ encryptedData, iv, encryptionKey = encryptionKeyEnv }) => {
  try {
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return { result: decrypted };
  } catch (error) {
    return { error };
  }
};

const decryptKey = ({ encryptedData, iv }) => {
  const { result, error } = decryptData({ encryptedData, iv });
  if (error) return '';
  return result;
};

module.exports = {
  encryptData,
  decryptData,
  decryptKey,
};
