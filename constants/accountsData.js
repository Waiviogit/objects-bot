const accountsData = process.env.ACC_DATA ? JSON.parse( process.env.ACC_DATA ) : [
    { name: 'guest123', postingKey: '5JRaypasxMx1L97ZUX7YuC5Psb5EAbF821kkAGtBj7xCJFQcbLg' },
    { name: 'social', postingKey: '5JrvPrQeBBvCRdjv29iDvkwn3EQYZ9jqfAHzrCyUvfbEbRkrYFC' }
];

module.exports = {
    accountsData: accountsData
};
