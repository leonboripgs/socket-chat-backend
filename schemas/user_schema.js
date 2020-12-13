const mongoose = require('mongoose');
const { Schema } = mongoose;
autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose.connection);

const UserSchema = new Schema({
  name: { type: String, default: "Unknown User"},
  uuid: {type: String, required: true},
  photo: {type: String, default: ""},
  symmetric: {type: String, default: ""}
});

UserSchema.plugin(autoIncrement.plugin, 'data_users')
module.exports = mongoose.model('data_users', UserSchema);
