const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, required: true },
  token: { type: String, required: true },
  joined: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
