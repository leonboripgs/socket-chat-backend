const mongoose = require('mongoose');
const { Schema } = mongoose;
autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

const MessageSchema = new Schema({
  roomId: { type: String, required: true },
  from: { type: String, required: true },
  memo: String,
  status: String,
  attachImages: [],
  created_at: { type: Date, default: Date.now()},
  updated_at: { type: Date, default: Date.now()},
  deleted: Boolean
});

MessageSchema.plugin(autoIncrement.plugin, 'data_messages')
module.exports = mongoose.model('data_messages', MessageSchema);
