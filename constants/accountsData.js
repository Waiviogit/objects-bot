const basicAccounts = process.env.ACC_DATA ? JSON.parse(process.env.ACC_DATA) : [
  { name: 'guest123', postingKey: '5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg' },
  { name: 'social', postingKey: '5JrvPrQeBBvCRdjv29iDvkwn3EQYZ9jqfAHzrCyUvfbEbRkrYFC' },
];
const guestOperationAccounts = process.env.ACC_DATA
  ? JSON.parse(process.env.PROXYBOT_ACC_DATA)
  : [];

module.exports = {
  basicAccounts,
  guestOperationAccounts,
};
