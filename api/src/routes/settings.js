const express = require('express');
const SettingController = require('../controllers/SettingController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);
router.get('/', SettingController.get);
router.put('/', SettingController.update);

module.exports = router;
