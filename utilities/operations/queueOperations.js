const { redisHelper } = require( '../redis' );
const { commentAction, postAction } = require( '../../constants/guestRequestsData' );

const queueSwitcher = async ( data ) => {
    return await redisHelper.addToQueue( data, data.comment.parent_author ? commentAction : postAction );
};


module.exports = { queueSwitcher };
