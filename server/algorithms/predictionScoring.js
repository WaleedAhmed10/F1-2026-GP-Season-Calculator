const { POINTS } = require('../config/constants');

/**
 * Score a single user prediction against actual race result.
 * - 25 pts: correct winner (P1)
 * - 10 pts: predicted driver finished on podium (P2-P3)
 * - 3 pts: predicted driver finished in points (P4-P10)
 * - 5 pts: participation (submitted before deadline)
 */
function scorePrediction(prediction, raceResult) {
  if (!raceResult || !raceResult.finishingOrder?.length) {
    return { participation: POINTS.PARTICIPATION, accuracy: 0, total: POINTS.PARTICIPATION };
  }

  const position = raceResult.finishingOrder.indexOf(prediction.driverId) + 1;
  let accuracy = 0;

  if (position === 1) {
    accuracy = POINTS.CORRECT_WINNER;
  } else if (position >= 2 && position <= 3) {
    accuracy = POINTS.CORRECT_PODIUM;
  } else if (position >= 4 && position <= 10) {
    accuracy = POINTS.CORRECT_TOP10;
  }

  return {
    participation: POINTS.PARTICIPATION,
    accuracy,
    total: POINTS.PARTICIPATION + accuracy,
    actualPosition: position || null
  };
}

/**
 * Recalculate total fantasy points for a user from all predictions.
 * Used after race results are entered or on leaderboard refresh.
 */
function calculateUserTotalPoints(predictions, raceResultsMap) {
  let total = 0;
  let correctWinners = 0;

  predictions.forEach((pred) => {
    const result = raceResultsMap.get(pred.raceId);
    const scored = scorePrediction(pred, result);
    total += scored.total;
    if (scored.actualPosition === 1) correctWinners += 1;
  });

  return { total, correctWinners };
}

/**
 * Stable leaderboard sort with tie-breaking:
 * 1. Total points (desc)
 * 2. Correct winner count (desc)
 * 3. Display name (asc)
 */
function rankLeaderboard(entries) {
  return [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if ((b.correctWinners || 0) !== (a.correctWinners || 0)) {
      return (b.correctWinners || 0) - (a.correctWinners || 0);
    }
    return (a.displayName || a.user).localeCompare(b.displayName || b.user);
  });
}

module.exports = {
  scorePrediction,
  calculateUserTotalPoints,
  rankLeaderboard
};
