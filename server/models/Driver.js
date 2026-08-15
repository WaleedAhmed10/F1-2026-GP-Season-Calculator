const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  flag: { type: String, required: true },
  team: { type: String, required: true }
});

module.exports = mongoose.model('Driver', driverSchema);
