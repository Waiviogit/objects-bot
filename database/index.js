const mongoose = require('mongoose');
const config = require('config');

mongoose.connect(config.mongoConnectionString, {
  useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true,
})
  .then(() => console.log('connection successful!'))
  .catch((error) => console.error(error));

mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

mongoose.Promise = global.Promise;

module.exports = {
  Mongoose: mongoose,
  models: {
    WObject: require('./schemas/wObjectSchema'),
    ObjectType: require('./schemas/ObjectTypeSchema'),
    GuestMana: require('./schemas/GuestManaSchema'),
    ServiceBot: require('./schemas/ServiceBotSchema'),
    GuestSpam: require('./schemas/GuestSpamSchema'),
  },
};
