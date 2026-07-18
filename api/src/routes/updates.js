const express = require('express');
const AuthMiddleware = require('../middleware/auth');
const UpdateController = require('../controllers/UpdateController');

const router = express.Router();
router.use(AuthMiddleware.verifyToken);
router.get('/', UpdateController.getAll);
router.put('/read-all', UpdateController.markAllRead);
router.put('/:id/read', UpdateController.markRead);

module.exports = router;
