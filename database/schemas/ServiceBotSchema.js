const mongoose = require('mongoose');

const { Schema } = mongoose;

const KeySchema = new Schema({
  iv: { type: String, required: true },
  encryptedData: { type: String, required: true },
}, { _id: false });

const ServiceBotSchema = new Schema(
  {
    name: {
      type: String, index: true, required: true, unique: true,
    },
    postingKey: { type: KeySchema },
    roles: { type: [String], required: true },
  },
  { timestamps: false },
);

const ServiceBot = mongoose.model('service_bots', ServiceBotSchema, 'service_bots');

module.exports = ServiceBot;
