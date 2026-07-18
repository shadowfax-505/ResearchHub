const express = require('express');
const AuthMiddleware = require('../middleware/auth');
const InterestController = require('../controllers/InterestController');

const router = express.Router();
router.use(AuthMiddleware.verifyToken);
router.get('/', InterestController.list);
router.put('/', InterestController.replace);
router.delete('/:interestType/:interestId', InterestController.remove);

module.exports = router;
