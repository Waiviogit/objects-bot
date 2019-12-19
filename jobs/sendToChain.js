const { postBroadcaster, commentBroadcaster } = require( '../utilities/operations/broadcastOperations' );

setInterval( async () => await postBroadcaster(), 5000 );
setInterval( async () => await commentBroadcaster(), 3000 );
