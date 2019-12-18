const { postBroadcaster, commentBroadcaster } = require( '../utilities/operations/broadcastOperations' );

setInterval( async () => await postBroadcaster(), 3000 );
setInterval( async () => await commentBroadcaster(), 500 );
