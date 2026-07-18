const express = require('express');
const SearchController = require('../controllers/SearchController');

const router = express.Router();
router.get('/', SearchController.search);
router.get('/facets', SearchController.facets);

module.exports = router;
