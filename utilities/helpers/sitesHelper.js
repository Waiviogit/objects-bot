const jsonOperations = require('utilities/operations/customJsonOperations');
const { CREATE_WEBSITE } = require('constants/sitesConstants');

exports.sendCreateWebsite = async (params) => {
  const data = {
    id: CREATE_WEBSITE,
    json: JSON.stringify(params),
  };
  return jsonOperations.accountsSwitcher(data, 'serviceBots');
};
