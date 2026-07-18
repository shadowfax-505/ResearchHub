const express = require('express');
const JobController = require('../controllers/JobController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', JobController.getAll);
router.get('/saved', AuthMiddleware.verifyToken, JobController.getSavedJobs);
router.get('/filters', JobController.getFilters);
router.get('/:id', JobController.getById);

router.post('/', AuthMiddleware.verifyToken, JobController.create);
router.post('/:id/save', AuthMiddleware.verifyToken, JobController.saveJob);
router.delete('/:id/save', AuthMiddleware.verifyToken, JobController.unsaveJob);

module.exports = router;
