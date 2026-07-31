const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(AuthMiddleware.verifyToken);

router.get('/', ProjectController.getAllPublic);
router.get('/me', ProjectController.getMyProjects);
router.post('/', ProjectController.createProject);
router.put('/:projectId/status', ProjectController.updateStatus);
router.get('/:projectId/updates', ProjectController.getUpdates);
router.post('/:projectId/updates', ProjectController.addUpdate);

module.exports = router;
