const {
  findMatchingExistingFlows,
  generatePracticeFlow,
  generateHealFlow,
  generateLearnFlow
} = require('../services/flowGenerationService');

const generatePractice = async (req, res) => {
  try {
    const {
      type = 'full_body',
      level = ['beginner'],
      bodyPart = null,
      timeRange = null
    } = req.body;
    
    const validTypes = ['preparatory', 'full_body', 'targeted'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be: preparatory, full_body, or targeted'
      });
    }
    
    const validLevels = ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old'];
    const levelsArray = Array.isArray(level) ? level : [level];
    const invalidLevels = levelsArray.filter(l => !validLevels.includes(l));
    
    if (invalidLevels.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid levels: ${invalidLevels.join(', ')}`
      });
    }
    
    if (type === 'targeted' && !bodyPart) {
      return res.status(400).json({
        success: false,
        message: 'bodyPart is required for targeted type'
      });
    }
    
    const userProfile = req.user ? {
      _id: req.user._id || req.user.id,
      diseases: req.user.profile?.diseases || [],
      injuries: req.user.profile?.injuries || []
    } : null;
    
    const criteria = {
      type,
      level: levelsArray,
      bodyPart,
      timeRange
    };
    
    const existingFlows = await findMatchingExistingFlows(
      { ...criteria, purpose: 'practice' },
      userProfile
    );
    
    const generatedFlow = await generatePracticeFlow(criteria, userProfile);
    
    if (generatedFlow.error) {
      return res.status(400).json({
        success: false,
        message: generatedFlow.error,
        data: {
          existingFlows: existingFlows.slice(0, 5)
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Practice flow generated successfully',
      data: {
        existingFlows: existingFlows.slice(0, 5),
        generatedFlow: {
          ...generatedFlow,
          isSaved: false,
          note: 'This flow is not saved. You can save it later if desired.'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate practice flow',
      error: error.message
    });
  }
};

const generateHeal = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for heal flow generation'
      });
    }
    
    const {
      bodyPart = null,
      disease = null,
      healingStage = 'beginning',
      injury = null,
      injuryLevel = null
    } = req.body;
    
    if (!bodyPart && !disease) {
      return res.status(400).json({
        success: false,
        message: 'At least one of bodyPart or disease must be provided'
      });
    }
    
    if (injuryLevel !== null && (injuryLevel < 1 || injuryLevel > 10)) {
      return res.status(400).json({
        success: false,
        message: 'Injury level must be between 1 and 10'
      });
    }
    
    const userProfile = {
      _id: req.user._id || req.user.id,
      diseases: req.user.profile?.diseases || [],
      injuries: req.user.profile?.injuries || []
    };
    
    const criteria = {
      bodyPart,
      disease,
      healingStage,
      injury,
      injuryLevel
    };
    
    const result = await generateHealFlow(criteria, userProfile);
    
    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }
    
    if (result.warning) {
      return res.json({
        success: true,
        warning: result.warning,
        suggestion: result.suggestion,
        data: {
          flow: {
            ...result.flow,
            isSaved: false,
            note: 'Rest and pranayama recommended. This flow is not saved.'
          }
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Healing flow generated successfully',
      data: {
        flow: {
          ...result,
          isSaved: false,
          note: 'This flow is not saved. You can save it later if desired.'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate heal flow',
      error: error.message
    });
  }
};

const generateLearn = async (req, res) => {
  try {
    const result = await generateLearnFlow(req.body, req.user);
    
    res.json({
      success: false,
      message: 'Learn flow generation is not yet implemented',
      data: {
        placeholder: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate learn flow',
      error: error.message
    });
  }
};

const saveGeneratedFlow = async (req, res) => {
  try {
    const {
      name,
      asanas,
      levels,
      bodyParts,
      estimatedTimeRange,
      purpose,
      description,
      isPublic = false
    } = req.body;
    
    if (!name || !purpose || !asanas || !Array.isArray(asanas) || asanas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Name, purpose, and asanas are required'
      });
    }
    
    const Flow = require('../models/Flow');
    const { processFlowAsanas, extractFlowLevels, extractFlowBodyParts, validateFlowAsanas } = require('../services/flowService');
    
    const userProfile = {
      _id: req.user._id || req.user.id,
      diseases: req.user.profile?.diseases || [],
      injuries: req.user.profile?.injuries || []
    };
    
    const checkSafety = req.user.role === 'user';
    const validation = await validateFlowAsanas(asanas, checkSafety, userProfile);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    const processedAsanas = processFlowAsanas(asanas);
    
    const flow = await Flow.create({
      name,
      madeBy: req.user.role,
      madeById: req.user.id,
      asanas: processedAsanas,
      levels: levels || extractFlowLevels(validation.asanas),
      bodyParts: bodyParts || await extractFlowBodyParts(validation.asanas, req.user.role, req.user.id),
      estimatedTimeRange: estimatedTimeRange || { min: 15, max: 30 },
      purpose,
      isPublic,
      description: description || ''
    });
    
    const populatedFlow = await Flow.findById(flow._id)
      .populate('asanas.asana', 'name level images bodyParts')
      .populate('madeById', 'name email role');
    
    res.status(201).json({
      success: true,
      message: 'Flow saved successfully',
      data: { flow: populatedFlow }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save flow',
      error: error.message
    });
  }
};

module.exports = {
  generatePractice,
  generateHeal,
  generateLearn,
  saveGeneratedFlow
};
