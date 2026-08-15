const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');

const router = express.Router();

router.get('/', leaderboardController.getTop);

module.exports = router;
