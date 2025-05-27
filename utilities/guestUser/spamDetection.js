const { promptWithJsonSchema } = require('../operations/gptService');
const { updateLastManaUpdateTimestamp } = require('./guestMana');
const { GuestSpamModel, UserModel } = require('../../models');

const spamSchema = {
  type: 'object',
  properties: {
    spam: {
      type: 'boolean',
      description: 'Whether the text is spam or phishing',
    },
    reason: {
      type: 'string',
      description: 'Explanation why the text is considered spam/phishing or legitimate',
    },
  },
  required: ['spam', 'reason'],
};

const spamSchemaObject = {
  name: 'spam_detection_schema',
  schema: spamSchema,
};

const detectSpamMessage = async ({ body, account }) => {
  const prompt = `Analyze this text for spam or phishing attempts. Text to analyze: ${body}`;
  const { result, error } = await promptWithJsonSchema({ prompt, jsonSchema: spamSchemaObject });
  if (error) return { error: null };
  if (!result) return { error: null };
  const { spam, reason } = result;
  if (!spam) return { error: null };

  // don't allow to post for some time
  await updateLastManaUpdateTimestamp({ account, mana: 0 });
  await GuestSpamModel.create({
    account, body, reason,
  });
  await UserModel.setSpamByName(account);

  const message = `Your message was detected as spam and was not posted.
Reason: ${reason}
For security reasons, you are temporarily blocked from posting new messages. If you believe this was a mistake, please contact support.`;

  return { error: { status: 422, message } };
};

module.exports = {
  detectSpamMessage,
};
