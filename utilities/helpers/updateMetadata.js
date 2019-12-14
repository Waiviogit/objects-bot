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
    metadata.comment = {
        userId: authorised_user.name,
        displayName: authorised_user.alias,
        social: authorised_user.auth.provider
    };
    return JSON.stringify( metadata );
};

module.exports = { metadataModify };
