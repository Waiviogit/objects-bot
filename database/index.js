const mongoose = require('mongoose');
const config = require('config');
const { waivioModels } = require('@waivio/types');

mongoose.connect(config.mongoConnectionString)
  .then(() => console.log('connection successful!'))
  .catch((error) => console.error(error));

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.Promise = global.Promise;

module.exports = {
  Mongoose: mongoose,
  models: {
    User: mongoose.model(...waivioModels.User),
    WObject: mongoose.model(...waivioModels.Wobject),
    ObjectType: mongoose.model(...waivioModels.ObjectType),
    GuestMana: mongoose.model(...waivioModels.GuestMana),
    ServiceBot: mongoose.model(...waivioModels.ServiceBot),
    GuestSpam: mongoose.model(...waivioModels.GuestSpam),
  },
};
