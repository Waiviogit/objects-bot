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
  const prompt = `
You are an AI spam and phishing detector for a review and rewards platform.

On this platform, it is normal for users to receive and view *reservation messages*—these include reward amounts, eligibility criteria, instructions for creating a review, and legal terms for participation.

**Reservation messages are legitimate and should NOT be flagged as spam or phishing, as long as they follow these expected patterns:**
- They describe the review/reward process.
- They mention eligibility requirements.
- They explain how to claim the reward and what conditions must be met.
- They include legal or payment terms.
- They reference specific products or services being reviewed.

Analyze the following text and ONLY flag it as spam or phishing if it contains clear indicators of malicious intent, deception, or unsolicited promotions *outside* the standard reservation message format.

Text to analyze:
${body}
`;

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
