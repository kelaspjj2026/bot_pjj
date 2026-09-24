const express = require('express');
const router = express.Router();
const rangkumanController = require('../controllers/rangkumanController');

router.get('/', rangkumanController.getAll);
router.get('/:id', rangkumanController.getById);
router.post('/', rangkumanController.create);
router.put('/:id', rangkumanController.update);
router.delete('/:id', rangkumanController.remove);
router.post('/:id/dispatch', rangkumanController.dispatch);

module.exports = router;
