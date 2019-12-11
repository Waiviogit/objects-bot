const { actionsDataClient } = require( './redis' );

const setActionsData = async ( key, data ) => {
    try{
        if ( key && data ) {
            for ( const field in data ) {
                await actionsDataClient.hsetAsync( key, field, data[ field ] );
            }
        }
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
