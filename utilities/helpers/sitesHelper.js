const jsonOperations = require('utilities/operations/customJsonOperations');

exports.websiteActions = async (params, id) => {
  const data = {
    id,
    json: JSON.stringify(params),
  };
  return jsonOperations.accountsSwitcher(data, 'serviceBots');
};
