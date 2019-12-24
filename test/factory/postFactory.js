const { Post } = require( '../../database' ).models;
const { faker, getRandomString } = require( '../testHelper' );
const { botMock } = require( '../mocks' );

const Create = async ( { author, onlyData, parent_author, parent_permlink, permlink, active_votes = [], app, language } = {} ) => {
    const json_metadata = {
        community: 'waiviotest',
        app: app || 'waiviotest',
        tags: [ 'testtag1', 'testtag2' ]
    };
    const post = {
        parent_author: parent_author || '',
        parent_permlink: parent_permlink || getRandomString( 15 ),
        author: author || faker.name.firstName(),
        permlink: permlink || getRandomString( 20 ),
        title: faker.address.city(),
        body: getRandomString( 100 ),
        json_metadata: JSON.stringify( json_metadata ),
        id: faker.random.number( 10000 ),
        active_votes,
        language: language || 'en-US',
        app: app || 'waiviotest',
        created: Date.now(),
        root_author: botMock[ 0 ].name
    };

    if ( onlyData ) { // return only post data, but not create into database
        return post;
    }
    await Post.create( post );
    return post;
};

module.exports = { Create };
