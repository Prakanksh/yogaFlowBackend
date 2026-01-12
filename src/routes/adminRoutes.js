const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserStatus,
  getSystemStats,
  updateDiseaseStatus,
  updateBodyPartStatus,
  getAllDiseases,
  getAllBodyParts
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/stats', getSystemStats);
router.get('/diseases', getAllDiseases);
router.put('/diseases/:id/status', updateDiseaseStatus);
router.get('/body-parts', getAllBodyParts);
router.put('/body-parts/:id/status', updateBodyPartStatus);

module.exports = router;
