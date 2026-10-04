const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  number: { type: Number, required: true },
  flag: { type: String, required: true },
  nationality: { type: String, required: true },
  team: { type: String, required: true },
  teamColor: { type: String, required: true },
  titles: { type: Number, default: 0 },
  rookie: { type: Boolean, default: false },
  seasonPosition: { type: Number, default: null },
  seasonPoints: { type: Number, default: 0 }
});

module.exports = mongoose.model('Driver', driverSchema);
