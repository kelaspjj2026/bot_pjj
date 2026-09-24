const express = require('express');
const router = express.Router();
const tugasController = require('../controllers/tugasController');

router.get('/', tugasController.getAll);
router.get('/:id', tugasController.getById);
router.post('/', tugasController.create);
router.put('/:id', tugasController.update);
router.delete('/:id', tugasController.remove);
router.post('/:id/dispatch', tugasController.dispatch);

module.exports = router;
