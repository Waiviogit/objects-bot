const { actionsDataClient } = require( './redis' );

const getHashKeysAll = async ( key ) => {
    const result = await actionsDataClient.keysAsync( key );

    return { result };
};

const getAllHashData = async ( key ) => {
    const result = await actionsDataClient.getAsync( key );

    return { result };
};

module.exports = { getHashKeysAll, getAllHashData };
