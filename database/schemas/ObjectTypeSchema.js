const mongoose = require('mongoose');
const { FIELDS_NAMES } = require('../../constants/wobjectsData');

const { Schema } = mongoose;

const ObjectTypeSchema = new Schema({
  name: { type: String, index: true, required: true },
  author: { type: String, require: true },
  permlink: { type: String, require: true },
  top_wobjects: { type: [String], default: [] },
  weight: { type: Number, default: 0 },
  top_experts: {
    type: [{
      name: { type: String },
      weight: { type: Number, default: 0 },
    }],
    default: [],
  },
  exposedFields: { type: [String], enum: [...Object.values(FIELDS_NAMES)], default: [] },
},
{
  toObject: { virtuals: true }, timestamps: true,
});

ObjectTypeSchema.index({ author: 1, permlink: 1 }, { unique: true });

const ObjectTypeModel = mongoose.model('objecttypes', ObjectTypeSchema, 'objecttypes');

module.exports = ObjectTypeModel;
