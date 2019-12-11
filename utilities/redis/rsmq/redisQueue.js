const createQueue = async ( { client, qname = 'queue' } ) => {
    if ( !client ) {
        return { error: { message: 'Client is required parameter' } };
    }
    try {
        const res = await client.createQueueAsync( { qname } );

        if ( res === 1 ) {
            return { result: true };
        }
        return { result: false };

    } catch ( e ) {
        if( e.message && e.message === 'Queue exists' ) {
            return { result: true, message: e.message };
        }
        return { error: e };
    }
};

const sendMessage = async ( { client, qname = 'queue', message } ) => {
    if ( !client ) {
        return { error: { message: 'Client is required parameter' } };
    }
    if ( message ) {
        const res = await client.sendMessageAsync( { qname, message } );

        if ( res ) {
            return { resId: res };
        }
    }
};

const receiveMessage = async ( { client, qname = 'queue' } ) => {
    if ( !client ) {
        return { error: { message: 'Client is required parameter' } };
    }
    const resp = await client.receiveMessageAsync( { qname } );

    if ( resp && resp.id && resp.message ) {
        try {
            if ( resp.message ) {
                return { message: resp.message, id: resp.id };
            }
        } catch ( error ) {
            return { error };
        }
    } else {
        return { error: { message: 'No messages' } };
    }
};

const deleteMessage = async ( { client, qname = 'queue', id } ) => {
    if ( !client ) {
        return { error: { message: 'Client is required parameter' } };
    }
    if ( id ) {
        const resp = await client.deleteMessageAsync( { qname, id } );

        if ( resp === 1 ) {
            return { result: true };
        }
    } else {
        return { result: false };
    }
};

module.exports = {
    createQueue,
    sendMessage,
    receiveMessage,
    deleteMessage
};
