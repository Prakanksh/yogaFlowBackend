const express = require('express');
const router = express.Router();
const {
  createFlow,
  getFlows,
  getFlowById,
  updateFlow,
  deleteFlow
} = require('../controllers/flowController');
const {
  generatePractice,
  generateHeal,
  generateLearn,
  saveGeneratedFlow
} = require('../controllers/flowGenerationController');
const { authenticate } = require('../middleware/auth');
const { optionalAuthenticate } = require('../middleware/optionalAuth');

router.get('/', optionalAuthenticate, getFlows);
router.get('/:id', optionalAuthenticate, getFlowById);

router.post('/', authenticate, createFlow);
router.post('/generate/practice', optionalAuthenticate, generatePractice);
router.post('/generate/heal', authenticate, generateHeal);
router.post('/generate/learn', optionalAuthenticate, generateLearn);
router.post('/save-generated', authenticate, saveGeneratedFlow);
router.put('/:id', authenticate, updateFlow);
router.delete('/:id', authenticate, deleteFlow);

module.exports = router;
