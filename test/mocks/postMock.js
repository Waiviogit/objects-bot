const { getRandomString, faker } = require( '../testHelper' );

module.exports = ( { author, permlink, parentAuthor, title, metadata, opts } = {} ) => ( {
    author: author || faker.name.firstName(),
    permlink: permlink || getRandomString( 10 ),
    parent_author: parentAuthor || faker.name.firstName(),
    parent_permlink: getRandomString( 10 ),
    title: title || getRandomString(),
    body: getRandomString( 20 ),
    json_metadata: metadata || getRandomString( 20 ),
    comment_options: opts || getRandomString( 10 )
} );