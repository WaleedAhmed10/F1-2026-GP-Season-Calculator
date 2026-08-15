const mongoose = require('mongoose');

const raceResultSchema = new mongoose.Schema({
  raceId: { type: Number, required: true, unique: true },
  finishingOrder: [{ type: String, required: true }],
  recordedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RaceResult', raceResultSchema);
