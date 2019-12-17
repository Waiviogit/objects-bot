const { redisHelper } = require( '../redis' );
const { commentAction, postAction } = require( '../../constants/guestRequestsData' );

const queueSwitcher = async( data ) => {
    if( !data.commentData.parent_author ) {
        return await redisHelper.addToQueue( data, postAction );
    }
    return await redisHelper.addToQueue( data, commentAction );
};

module.exports = { queueSwitcher };
