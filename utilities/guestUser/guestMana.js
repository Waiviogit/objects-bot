const { GuestManaModel } = require('../../models');

const MANA_CONSUMPTION = {
  FIELD_VOTE: 2,
  FIELD: 1,
  VOTE: 1,
  POST: 100,
  COMMENT: 25,
  CUSTOM_JSON: 1,
};

// if become global set to redis
const MAX_MANA = 1000;

const regenerationRatePerSecond = 42 / (60 * 60); // 42 mana per hour

const getManaRecord = async (account) => {
  const { result } = await GuestManaModel.findOneByName(account);
  if (result) return result;
  return GuestManaModel.create({ account, mana: MAX_MANA });
};

const updateLastManaUpdateTimestamp = async ({ account, cost }) => {
  const lastManaUpdate = Date.now();
  await GuestManaModel.updateOneMana({ account, cost, lastManaUpdate });
};

// Function to calculate mana regeneration
const calculateManaRegeneration = (lastUpdateTimestamp) => {
  const now = Date.now();
  const elapsedSeconds = (now - lastUpdateTimestamp) / 1000;

  const regeneratedMana = elapsedSeconds * regenerationRatePerSecond;
  return Math.floor(regeneratedMana);
};

const getCurrentMana = async (account) => {
  if (!account.includes('_')) return 0;

  const record = await getManaRecord(account);
  const { lastManaUpdate, mana } = record;

  const regeneratedMana = calculateManaRegeneration(lastManaUpdate);

  return Math.min(MAX_MANA, mana + regeneratedMana);
};

const consumeMana = async ({ account = '', cost = MANA_CONSUMPTION.FIELD }) => {
  if (!account.includes('_')) return;

  const currentMana = await getCurrentMana(account);

  if (currentMana >= cost) {
    await updateLastManaUpdateTimestamp({ account, cost });
    return true;
  }
};

const validateMana = async ({ account, cost = MANA_CONSUMPTION.FIELD_VOTE }) => {
  const currentMana = await getCurrentMana(account);

  return currentMana >= cost;
};

module.exports = {
  consumeMana,
  getCurrentMana,
  validateMana,
  MANA_CONSUMPTION,
};
