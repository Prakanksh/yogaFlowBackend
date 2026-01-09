const express = require('express');
const router = express.Router();
const { getBodyParts, addBodyPart } = require('../controllers/bodyPartController');
const { authenticate } = require('../middleware/auth');

router.get('/', getBodyParts);
router.post('/', authenticate, addBodyPart);

module.exports = router;
