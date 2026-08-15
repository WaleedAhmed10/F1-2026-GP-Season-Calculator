const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true },
  points: { type: Number, default: 0 },
  correctWinners: { type: Number, default: 0 },
  displayName: { type: String, required: true }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
