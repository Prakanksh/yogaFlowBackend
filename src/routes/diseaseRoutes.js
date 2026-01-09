const express = require('express');
const router = express.Router();
const { getDiseases, addDisease } = require('../controllers/diseaseController');
const { authenticate } = require('../middleware/auth');

router.get('/', getDiseases);
router.post('/', authenticate, addDisease);

module.exports = router;
