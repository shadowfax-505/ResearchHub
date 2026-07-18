const express = require('express');
const NotificationController = require('../controllers/NotificationController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);
router.get('/', NotificationController.getAll);
router.put('/:notificationId/read', NotificationController.markRead);

module.exports = router;
