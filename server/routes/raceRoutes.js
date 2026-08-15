const express = require('express');
const raceController = require('../controllers/raceController');

const router = express.Router();

router.get('/', raceController.getAll);

module.exports = router;
