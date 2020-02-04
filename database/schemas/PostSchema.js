const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  id: { type: Number, required: true },
  author: { type: String, required: true },
  author_reputation: { type: Number, default: 0 }, // rate author in steem
  author_weight: { type: Number, default: 0 }, // rate author in waivio
  permlink: { type: String, required: true },
  parent_author: { type: String, default: '' },
  parent_permlink: { type: String, default: '' },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  json_metadata: { type: String, default: '' },
  app: { type: String },
  depth: { type: Number },
  category: { type: String },
  last_update: { type: String },
  created: { type: String },
  active: { type: String },
  last_payout: { type: String },
  children: { type: Number, default: 0 },
  net_rshares: { type: Number, default: 0 },
  abs_rshares: { type: Number, default: 0 },
  vote_rshares: { type: Number, default: 0 },
  children_abs_rshares: { type: Number },
  cashout_time: { type: String },
  reward_weight: { type: String },
  total_payout_value: { type: String },
  curator_payout_value: { type: String },
  author_rewards: { type: Number },
  net_votes: { type: Number },
  root_author: { type: String },
  root_permlink: { type: String },
  root_title: { type: String },
  max_accepted_payout: { type: String },
  percent_steem_dollars: { type: Number },
  allow_replies: { type: Boolean },
  allow_votes: { type: Boolean },
  allow_curation_rewards: { type: Boolean },
  beneficiaries: [{
    account: { type: String },
    weight: { type: Number },
  }],
  url: { type: String },
  pending_payout_value: { type: String },
  total_pending_payout_value: { type: String },
  total_vote_weight: { type: Number },
  promoted: { type: String },
  body_length: { type: Number },
  active_votes: {
    type: [{
      voter: { type: String },
      weight: { type: Number },
      percent: { type: Number },
    }],
    default: [],
  },
  wobjects: [{
    author_permlink: { type: String, index: true },
    percent: { type: Number },
    tagged: { type: String },
  }],
  language: { type: String, default: 'en-US' },
  reblog_to: { type: { author: String, permlink: String } },
}, { strict: false, timestamps: true });

PostSchema.index({ author: 1, permlink: 1 }, { unique: true });

const PostModel = mongoose.model('Post', PostSchema);

module.exports = PostModel;
