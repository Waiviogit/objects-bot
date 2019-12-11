const { actionsDataClient } = require( './redis' );

const setActionsData = async ( key, data ) => {
    if ( key && data ) {
        for ( const field in data ) {
            await actionsDataClient.hsetAsync( key, field, data[ field ] );
        }
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
