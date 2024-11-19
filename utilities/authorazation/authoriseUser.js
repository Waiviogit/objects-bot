const { getNamespace } = require('cls-hooked');
const waivioAuthorise = require('utilities/authorazation/waivioAuth/autorise');
const config = require('../../config');

/**
 * Authorise particular user with "access-token" from session(if it exist) and set "authorised_user" to current session
 * @param username Name of user(steem, facebook, google etc.)
 * @param accessKey
 * @returns {Promise<{error: {message: string, status: number}}|{isValid: boolean}>}
 * Return {isValid: true} if user authorised successfully, or {error} if Token not exist or not valid
 */
exports.authorise = async (username, accessKey = '') => {
  const session = getNamespace('request-session');
  const accessToken = session.get('access-token');
  const isWaivioAuth = session.get('waivio-auth');
  let isValidToken;

  if (isWaivioAuth) {
    isValidToken = await waivioAuthorise.authorise(username, accessToken);
  } if (isValidToken) {
    return { isValid: true };
  }

  if (accessKey) {
    isValidToken = config.accessKeys.includes(accessKey);
    if (isValidToken) return { isValid: true };
  }

  return { error: { status: 401, message: 'Token not valid!' } };
};
