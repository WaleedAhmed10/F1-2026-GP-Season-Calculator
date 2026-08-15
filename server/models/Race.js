const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  flag: { type: String, required: true },
  date: { type: String, required: true },
  circuit: { type: String, required: true }
});

module.exports = mongoose.model('Race', raceSchema);
