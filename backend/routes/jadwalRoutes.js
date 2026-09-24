const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

router.get('/', jadwalController.getAll);
router.get('/today', jadwalController.getToday);
router.get('/day/:day', jadwalController.getByDay);
router.get('/:id', jadwalController.getById);
router.post('/', jadwalController.create);
router.put('/:id', jadwalController.update);
router.delete('/:id', jadwalController.remove);

module.exports = router;
