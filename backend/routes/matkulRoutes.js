const express = require('express');
const router = express.Router();
const matkulController = require('../controllers/matkulController');

router.get('/', matkulController.getAll);
router.get('/:id', matkulController.getById);
router.post('/', matkulController.create);
router.put('/:id', matkulController.update);
router.delete('/:id', matkulController.remove);

module.exports = router;
