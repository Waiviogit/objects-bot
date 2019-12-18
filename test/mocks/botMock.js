const { getRandomString, faker } = require( '../testHelper' );

module.exports = [
    { name: faker.name.firstName(), postingKey: getRandomString( 10 ) },
    { name: faker.name.firstName(), postingKey: getRandomString( 10 ) }
];
