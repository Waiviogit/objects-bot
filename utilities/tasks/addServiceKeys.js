const Joi = require('joi');
const config = require('config');
const { ServiceBot } = require('../../database').models;
const serviceKeys = require('../../serviceKeys.json');
const { encryptData } = require('../helpers/encryptionHelper');
const { redisSetter } = require('../redis');
const { CACHE_SERVICE_BOTS } = require('../../constants/redisBlockNames');

const keysSchema = Joi
  .array()
  .items(
    Joi.object().keys({
      name: Joi.string().required(),
      postingKey: Joi.string().required(),
      roles: Joi.array().items(Joi.string().valid(...['serviceBot', 'proxyBot', 'reviewBot'])).min(1),
    }),
  )
  .required();

const addServiceKeys = async (encryptionKey) => {
  if (!encryptionKey) throw new Error('encryptionKey is missed');
  if (!serviceKeys?.length) throw new Error('serviceKeys file not found');

  // delete old cache redis
  await redisSetter.del({ key: CACHE_SERVICE_BOTS });

  const { value: validBots, error } = keysSchema.validate(serviceKeys);
  if (error) throw new Error(error.message);

  const keyBuff = Buffer.from(encryptionKey, 'hex');

  for (const bot of validBots) {
    const { name, roles, postingKey } = bot;

    const { encryptedData, iv, error: encriptionError } = encryptData({
      data: postingKey,
      encryptionKey: keyBuff,
    });
    if (encriptionError) throw new Error(encriptionError.message);

    await ServiceBot.updateOne(
      {
        name,
      },
      {
        roles,
        postingKey: {
          encryptedData,
          iv,
        },
      },
      {
        upsert: true,
      },
    );
  }

  console.log('task competed');
};

(async () => {
  const encryptionKey = process.argv[2] || config.botsEncryptionKey;
  await addServiceKeys(encryptionKey);
  process.exit();
})();
