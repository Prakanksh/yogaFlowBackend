const express = require('express');
const router = express.Router();
const {
  createAsana,
  getAsanas,
  getAsanaById,
  updateAsana,
  deleteAsana
} = require('../controllers/asanaController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { optionalAuthenticate } = require('../middleware/optionalAuth');

router.get('/', optionalAuthenticate, getAsanas);
router.get('/:id', optionalAuthenticate, getAsanaById);

router.post('/', authenticate, authorize('teacher', 'admin'), createAsana);
router.put('/:id', authenticate, updateAsana);
router.delete('/:id', authenticate, deleteAsana);

module.exports = router;
