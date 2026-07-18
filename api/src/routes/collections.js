const express = require('express');
const CollectionController = require('../controllers/CollectionController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);
router.get('/', AuthMiddleware.verifyToken, CollectionController.getAll);
router.post('/', AuthMiddleware.verifyToken, CollectionController.create);
router.get('/:name/papers', AuthMiddleware.verifyToken, CollectionController.getPapers);

module.exports = router;
