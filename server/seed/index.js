const Driver = require('../models/Driver');
const Race = require('../models/Race');
const { SEED_DRIVERS, SEED_RACES } = require('./data');

async function seedDatabase() {
  const driverCount = await Driver.countDocuments();
  if (driverCount === 0) {
    await Driver.insertMany(SEED_DRIVERS);
    console.log('Drivers seeded');
  }

  const raceCount = await Race.countDocuments();
  if (raceCount === 0) {
    await Race.insertMany(SEED_RACES);
    console.log('Races seeded');
  }
}

module.exports = seedDatabase;
