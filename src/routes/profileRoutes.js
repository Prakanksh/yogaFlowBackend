const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getProfile);
router.put('/', authenticate, updateProfile);

module.exports = router;
