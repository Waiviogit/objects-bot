const PERMLINK_MAX_LEN = 255;

const genRandomString = ( stringLength ) => {
    let randomString = '';
    let randomAscii;
    const asciiLow = 65;
    const asciiHigh = 90;

    for ( let i = 0; i < stringLength; i += 1 ) {
        randomAscii = Math.floor( Math.random() * ( asciiHigh - asciiLow ) + asciiLow );
        randomString += String.fromCharCode( randomAscii );
    }
    return randomString;
};

module.exports = ( string ) => {
    const permlink = `${genRandomString( 3 )}-${string}`
        .toLowerCase()
        .replace( /[ _]/g, '-' )
        .replace( /[^a-z0-9-]+/g, '' );

    return permlink.length > PERMLINK_MAX_LEN ? permlink.substring( 0, PERMLINK_MAX_LEN ) : permlink;
};

