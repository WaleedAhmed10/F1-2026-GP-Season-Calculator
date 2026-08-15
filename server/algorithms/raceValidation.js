function isRaceOpenForPredictions(race) {
  if (!race?.date) return true;
  const raceDate = new Date(race.date);
  raceDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today < raceDate;
}

function getRaceStatus(race, hasResult) {
  if (hasResult) return 'completed';
  if (!isRaceOpenForPredictions(race)) return 'locked';
  return 'upcoming';
}

module.exports = { isRaceOpenForPredictions, getRaceStatus };
