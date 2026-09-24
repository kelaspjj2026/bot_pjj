const express = require('express');
const router = express.Router();
const titipAbsenController = require('../controllers/titipAbsenController');

router.get('/', titipAbsenController.getAll);
router.delete('/clear-all', titipAbsenController.clearAll);
router.delete('/:id', titipAbsenController.remove);

module.exports = router;
