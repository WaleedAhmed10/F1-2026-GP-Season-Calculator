const { recalculateLeaderboard } = require('../services/leaderboardService');

exports.getTop = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const ranked = await recalculateLeaderboard();
    res.json(ranked.slice(0, limit));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
