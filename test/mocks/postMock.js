const { getRandomString, faker } = require( '../testHelper' );

module.exports = ( { author, permlink, parentAuthor, title, metadata, beneficiaries } = {} ) => ( {
    author: author || faker.name.firstName(),
    permlink: permlink || getRandomString( 10 ),
    parent_author: parentAuthor || '',
    parent_permlink: getRandomString( 10 ),
    title: title || getRandomString(),
    body: getRandomString( 20 ),
    json_metadata: metadata || JSON.stringify( { some: 'test', data: 'test' } ),
    comment_options: {
        extensions: [
            [
                0,
                {
                    beneficiaries: [ {
                        account: beneficiaries || getRandomString(),
                        weight: faker.random.number()
                    } ]
                }
            ]
        ]
    }

} );
