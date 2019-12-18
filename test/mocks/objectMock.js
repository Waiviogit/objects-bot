const { faker, getRandomString } = require( '../testHelper' );

module.exports = ( { author, title, permlink, extending } = {} ) => ( {
    author: author || faker.name.firstName(),
    title: title || getRandomString( 10 ),
    body: getRandomString( 20 ),
    permlink: permlink || getRandomString( 10 ),
    objectName: faker.name.firstName(),
    locale: getRandomString( 10 ),
    isExtendingOpen: extending || true,
    isPostingOpen: true,
    parentAuthor: faker.name.firstName(),
    parentPermlink: getRandomString( 10 ),
    field: {
        name: getRandomString( 10 ),
        body: getRandomString( 10 ),
        locale: getRandomString( 10 )
    }
} );
