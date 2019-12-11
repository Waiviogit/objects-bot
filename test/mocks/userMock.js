const { faker, getRandomString } = require( '../testHelper' );

module.exports = ( { name, alias } = {} ) => ( {
    data: {
        user: {
            name: name || faker.name.firstName(),
            alias: alias || getRandomString( 10 )
        }
    }

} );
