const express = require('express');
const championshipController = require('../controllers/championshipController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/drivers', championshipController.getDriverStandings);
router.get('/constructors', championshipController.getConstructorStandings);
router.get('/simulation', championshipController.getChampionshipSimulation);
router.get('/results', championshipController.getRaceResults);
router.post('/results', authenticate, championshipController.submitRaceResult);
router.get('/export', authenticate, championshipController.exportData);

module.exports = router;
