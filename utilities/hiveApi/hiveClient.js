const _ = require('lodash');
const HIVE = require('@hiveio/dhive');
const { nodeUrls } = require('constants/appData');

const hiveClients = (() => {
  const clients = [];
  for (const node of nodeUrls) {
    clients.push(new HIVE.Client(node, {
      timeout: 8 * 1000, failoverThreshold: 4, rebrandedApi: true,
    }));
  }
  return clients;
})();

const reloadClients = () => {
  hiveClients.length = 0;
  for (const node of nodeUrls) {
    hiveClients.push(new HIVE.Client(node, {
      timeout: 8 * 1000, failoverThreshold: 1, rebrandedApi: true,
    }));
  }
};

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
    if (_.get(data, 'error.status') === 422) return data;
    if (i === hiveClients.length - 1) {
      reloadClients();
      console.log('---------------renew clients');
      return { error: data.error };
    }
    if (data.error) {
      console.log('---------------switch client');
      this.client = getHiveClient(this.client);
    }
  }
};
