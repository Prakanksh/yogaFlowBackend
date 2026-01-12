const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const profileRoutes = require('./profileRoutes');
const diseaseRoutes = require('./diseaseRoutes');
const bodyPartRoutes = require('./bodyPartRoutes');
const asanaRoutes = require('./asanaRoutes');
const flowRoutes = require('./flowRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/diseases', diseaseRoutes);
router.use('/body-parts', bodyPartRoutes);
router.use('/asanas', asanaRoutes);
router.use('/flows', flowRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
