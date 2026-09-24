const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getAll);
router.get('/bot-status', settingsController.getBotStatus);
router.get('/wa/groups', settingsController.getWAGroups);
router.post('/wa/reset', settingsController.resetWA);
router.post('/wa/status', settingsController.getWAStatus);
router.post('/wa/test-group', settingsController.testGroupDispatch);
router.post('/wa/test-individual', settingsController.testIndividualDispatch);
router.get('/:key', settingsController.get);
router.post('/', settingsController.set);
router.delete('/:key', settingsController.remove);

module.exports = router;
