const { getNamespace } = require( 'cls-hooked' );

const metadataModify = ( json_metadata ) => {
    let metadata;
    const session = getNamespace( 'request-session' );
    const authorised_user = session.get( 'authorised_user' );

    try{
        metadata = JSON.parse( json_metadata );
    } catch( error ) {
        return { error };
    }
    metadata.alias = authorised_user.alias;
    return JSON.stringify( metadata );
};

module.exports = { metadataModify };
