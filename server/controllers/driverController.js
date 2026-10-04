const Driver = require('../models/Driver');
const { sortDrivers } = require('../seed/data');

exports.getAll = async (req, res) => {
  try {
    const drivers = await Driver.find({}, { _id: 0, __v: 0 });
    res.json(sortDrivers(drivers));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
