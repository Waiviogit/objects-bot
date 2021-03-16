const _ = require('lodash');
const HIVE = require('@hiveio/dhive');

const nodeUrls = ['https://api.hive.blog', 'https://rpc.esteem.app', 'https://anyx.io'];

const hiveClients = (() => {
  const clients = [];
  for (const node of nodeUrls) {
    clients.push(new HIVE.Client(node, {
      timeout: 8 * 1000, failoverThreshold: 4, rebrandedApi: true,
    }));
  }
  return clients;
})();

const getHiveClient = (hiveClient) => {
  if (!hiveClient) return hiveClients[0];
  const currentClientIndex = _.findIndex(hiveClients,
    (client) => client.currentAddress === hiveClient.currentAddress);
  return hiveClients[currentClientIndex === hiveClients.length - 1 ? 0 : currentClientIndex + 1];
};

exports.client = getHiveClient();

exports.rcApi = new HIVE.RCAPI(this.client);

exports.execute = async (method, params) => {
  for (let i = 0; i < hiveClients.length; i++) {
    const data = await method(this.client, params);
    if (!_.get(data, 'error')) return data;
    if (i === hiveClients.length - 1) {
      return { error: data.error };
    }
    if (data.error) this.client = getHiveClient(this.client);
  }
};
