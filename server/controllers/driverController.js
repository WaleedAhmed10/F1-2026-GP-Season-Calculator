const Driver = require('../models/Driver');

exports.getAll = async (req, res) => {
  try {
    const drivers = await Driver.find({}, { _id: 0, __v: 0 }).sort({ team: 1, name: 1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
