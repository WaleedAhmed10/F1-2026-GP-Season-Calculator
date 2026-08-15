const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  raceId: { type: Number, required: true },
  driverId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

predictionSchema.index({ userName: 1, raceId: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);
