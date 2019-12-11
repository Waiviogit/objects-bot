const { waivio_auth } = require( '../../../config' );
const axios = require( 'axios' );
const VALIDATE_TOKEN_URL = `https://${waivio_auth.host}/${waivio_auth.baseUrl}/${waivio_auth.validateTokenPath}`;
const _ = require( 'lodash' );

const validateTokenRequest = async ( token ) => {
    try {
        const { data: response } = await axios.post( VALIDATE_TOKEN_URL, token );

        if ( response ) {
            return { response };
        }
        return { error: { message: 'Not enough response data!' } };
    } catch ( error ) {
        console.error( error );
        return { error };
    }
};

/**
 * Authorise user using token of waivioAuthService
 * @param {string} token Valid waivio-auth token
 * @param {string} username User name for particular token
 * @returns {Boolean}  true if "token" valid for current "username", else false
 */
exports.authorise = async ( token = '', username = '' ) => {
    const { response, error } = await validateTokenRequest( token );

    if( error ) {
        return false;
    }
    return _.get( response, 'user.name' ) === username;
};
