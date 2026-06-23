/**
 * Field Routes
 * API endpoints for research field operations
 */

const express = require('express');
const FieldController = require('../controllers/FieldController');

const router = express.Router();

router.get('/hierarchy', FieldController.getHierarchy);
router.get('/stats', FieldController.getStats);
router.get('/search', FieldController.search);
router.get('/:fieldId', FieldController.getById);
router.get('/', FieldController.getAll);

module.exports = router;
