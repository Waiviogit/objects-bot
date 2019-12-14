const { redisHelper } = require( '../redis' );
const { commentAction, postAction } = require( '../../constants/guestRequestsData' );

const queueSwitcher = async( postingData ) => {
    if( !postingData.post.parent_author ) {
        return await redisHelper.addToQueue( postingData, postAction );
    }
    return await redisHelper.addToQueue( postingData, commentAction );
};

module.exports = { queueSwitcher };
