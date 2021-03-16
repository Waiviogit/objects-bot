const { PrivateKey } = require('@hiveio/dhive');

exports.post = async (client, { data, key }) => {
  try {
    return { result: await client.broadcast.comment(data, PrivateKey.fromString(key)) };
  } catch (error) {
    return { error };
  }
};

exports.postWithOptions = async (client, { comment, options, key }) => {
  try {
    return {
      result: await client.broadcast.commentWithOptions(
        comment, options, PrivateKey.fromString(key),
      ),
    };
  } catch (error) {
    if (error.message === 'Invalid parameters') {
      return { error: { message: 'Invalid parameters', status: 422 } };
    }
    return { error };
  }
};

exports.customJSON = async (client, { data, account }) => {
  try {
    return {
      result: await client.broadcast.json({
        id: data.id,
        json: data.json,
        required_auths: [],
        required_posting_auths: [account.name],
      },
      PrivateKey.fromString(account.postingKey)),
    };
  } catch (error) {
    console.error(error.message);
    return { error };
  }
};

exports.getComment = async (client, { author, permlink }) => {
  try {
    const userComment = await client.database.call('get_content', [author, permlink]);

    if (userComment.author) {
      return { userComment };
    }
    return { error: { message: 'Comment not found!', status: 404 } };
  } catch (error) {
    return { error };
  }
};

exports.getAccountRC = async (rcApi, accountName) => {
  try {
    const RCAccount = await rcApi.findRCAccounts([accountName]);
    const result = await rcApi.calculateRCMana(RCAccount[0]);
    return result.current_mana;
  } catch (error) {
    return { error };
  }
};
