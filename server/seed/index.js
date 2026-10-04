const Driver = require('../models/Driver');
const Race = require('../models/Race');
const { SEED_DRIVERS, SEED_RACES } = require('./data');

async function seedDatabase() {
  const ids = SEED_DRIVERS.map((d) => d.id);
  await Promise.all(
    SEED_DRIVERS.map((driver) =>
      Driver.updateOne({ id: driver.id }, { $set: driver }, { upsert: true })
    )
  );
  await Driver.deleteMany({ id: { $nin: ids } });
  console.log('Drivers synced');

  await Promise.all(
    SEED_RACES.map((race) =>
      Race.updateOne({ id: race.id }, { $set: race }, { upsert: true })
    )
  );
  console.log('Races synced');
}

module.exports = seedDatabase;
