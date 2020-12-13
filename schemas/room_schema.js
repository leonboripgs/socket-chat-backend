const mongoose = require('mongoose');
const { Schema } = mongoose;
autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

const RoomSchema = new Schema({
  user: { type: String, required: true },
  other_user: { type: String, required: true },
  symmetric: {type: String, required: true},
  created_at: { type: Date, default: Date.now()},
  deleted: Boolean
});

RoomSchema.plugin(autoIncrement.plugin, 'data_rooms')
module.exports = mongoose.model('data_rooms', RoomSchema);
