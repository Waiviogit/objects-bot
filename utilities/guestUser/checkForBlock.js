const { UserModel } = require('../../models');

const checkForBlock = async (name) => {
  if (!name.includes('_')) return { error: null };

  const blocked = await UserModel.findOneBlockedByName(name);
  if (!blocked) return { error: null };
  return { error: { status: 403, message: 'You cannot perform this action because your account is blocked.' } };
};

module.exports = checkForBlock;
