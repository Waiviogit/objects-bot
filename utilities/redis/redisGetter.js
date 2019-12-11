const { actionsDataClient } = require( './redis' );

const getHashKeysAll = async function ( key ) {
    const res = await actionsDataClient.keysAsync( key );

    return res;
};

module.exports = { getHashKeysAll };
