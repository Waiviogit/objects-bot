const createQueue = async ({ client, qname = 'queue' }) => {
  if (!client) return { error: { message: 'Client is required parameter' } };
  try {
    const res = await client.createQueueAsync({ qname });

    if (res === 1) return { result: true };
    return { result: false };
  } catch (e) {
    if (e.message && e.message === 'Queue exists') return { result: true, message: e.message };
    return { error: e };
  }
};

const sendMessage = async ({ client, qname = 'queue', message }) => {
  if (!client) return { error: { message: 'Client is required parameter' } };
  if (message) {
    try {
      return await client.sendMessageAsync({ qname, message });
    } catch (error) {
      return { error };
    }
  }
};

const receiveMessage = async ({ client, qname = 'queue' }) => {
  if (!client) return { error: { message: 'Client is required parameter' } };
  let resp;

  try {
    resp = await client.receiveMessageAsync({ qname, vt: 0 });
  } catch (error) {
    return { error };
  }
  if (resp && resp.id && resp.message) return { result: { message: resp.message, id: resp.id } };
  return { error: { message: 'No messages' } };
};

const deleteMessage = async ({ client, qname = 'queue', id }) => {
  if (!client) return { error: { message: 'Client is required parameter' } };
  if (id) {
    const resp = await client.deleteMessageAsync({ qname, id });

    if (resp === 1) return { result: true };
  } else return { result: false };
};

module.exports = {
  createQueue,
  sendMessage,
  receiveMessage,
  deleteMessage,
};
