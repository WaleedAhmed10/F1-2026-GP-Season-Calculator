const express = require('express');
const predictionController = require('../controllers/predictionController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, predictionController.getMine);
router.get('/race/:raceId', predictionController.getByRace);
router.post('/', authenticate, predictionController.createOrUpdate);
router.delete('/', authenticate, predictionController.deleteAll);

module.exports = router;
