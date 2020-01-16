const { actionsDataClient } = require( './redis' );

const setActionsData = async ( key, data ) => {
    try{
        await actionsDataClient.setAsync( key, data );
    } catch( error ) {
        return { error };
    }
};

const delActionsData = async ( key ) => {
    if ( key ) {
        await actionsDataClient.del( key );
    }
};

module.exports = {
    setActionsData,
    delActionsData
};
