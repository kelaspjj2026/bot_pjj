const express = require('express');
const router = express.Router();
const pengumumanController = require('../controllers/pengumumanController');

router.get('/', pengumumanController.getAll);
router.get('/:id', pengumumanController.getById);
router.post('/', pengumumanController.create);
router.put('/:id', pengumumanController.update);
router.delete('/:id', pengumumanController.remove);
router.post('/:id/dispatch', pengumumanController.dispatch);
router.get('/:id/logs', pengumumanController.getLogs);

module.exports = router;
