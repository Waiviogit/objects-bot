const crypto = require('crypto');
// 256-bit key
const generateEncryptionKey = () => crypto.randomBytes(32).toString('hex');

(async () => {
  console.log('Save your key:');
  console.log(generateEncryptionKey());
})();
