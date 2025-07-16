const { promptWithJsonSchema } = require('../operations/gptService');
const { updateLastManaUpdateTimestamp } = require('./guestMana');
const { GuestSpamModel, UserModel } = require('../../models');
const { isNameInWhiteList } = require('../redis/redisGetter');

const spamSchema = {
  type: 'object',
  properties: {
    spamDegree: {
      type: 'integer',
      minimum: 0,
      maximum: 5,
      description: [
        'Spam severity on a scale from 0 to 5.',
        '0 = Not spam at all.',
        '1 = Very likely legitimate, but contains some minor spam-like features.',
        '2 = Slight suspicion, but probably OK.',
        '3 = Mixed, contains notable spam indicators but not outright spam.',
        '4 = Strongly suspicious, likely spam.',
        '5 = Definitely spam or phishing.',
      ].join(' '),
    },
    reason: {
      type: 'string',
      description: 'Explanation of why this score was given (describe features, not just “spam”/“not spam”).',
    },
  },
  required: ['spamDegree', 'reason'],
};

const spamSchemaObject = {
  name: 'spam_detection_schema',
  schema: spamSchema,
};

const detectSpamMessage = async ({ body, account }) => {
  const inWhiteList = await isNameInWhiteList(account);
  if (inWhiteList) return { error: null };

  const prompt = `
You are an AI spam detector posting platform

There are two main types of legitimate posts on this platform:
1. **Reservation messages** — These contain reward information, eligibility criteria, review instructions, and legal/payment terms.
2. **Regular user posts** — These may share experiences, opinions, educational content, or include personal or professional links (such as blogs or social media profiles).

**IMPORTANT:**
- Do NOT flag a post as spam just because it contains an external link.
- It is normal for posts to include links to personal blogs, social profiles, or professional websites.
- Only flag a post as spam or phishing if the link or the post itself shows clear signs of malicious intent, scams, phishing, malware, deception, impersonation, or irrelevant/unrelated unsolicited promotions.

Examples of acceptable posts:
- Personal stories, reviews, reflections, or educational content (with or without links)
- Reservation messages in the expected format
- Posts sharing a user’s own website, blog, portfolio, or social profile

**Only flag as spam if:**
- The post attempts to trick, deceive, or defraud users (phishing, impersonation, fake offers)
- The post contains obvious scams, malware
- The post is an unsolicited and irrelevant mass promotion (such as unrelated ads, crypto, gambling, or adult content)

**Do NOT** flag as spam:
- Posts about nature, life, vacations, opinions, or everyday experiences
- Posts with personal or professional links that do not meet the spam/phishing criteria above

Text to analyze:
${body}
`;

  const { result, error } = await promptWithJsonSchema({ prompt, jsonSchema: spamSchemaObject });
  if (error) return { error: null };
  if (!result) return { error: null };
  const { spamDegree, reason } = result;

  const spam = spamDegree > 3;
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
