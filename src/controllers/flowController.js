const Flow = require('../models/Flow');
const Asana = require('../models/Asana');
const {
  validateFlowAsanas,
  processFlowAsanas,
  extractFlowLevels,
  extractFlowBodyParts,
  calculateEstimatedTime,
  isFlowSafeForUser
} = require('../services/flowService');

const createFlow = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    if (userRole !== 'teacher' && userRole !== 'admin' && userRole !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Only users, teachers, and admins can create flows'
      });
    }
    
    const {
      name,
      asanas,
      purpose,
      isPublic = false,
      description,
      estimatedTimeRange
    } = req.body;
    
    if (!name || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Name and purpose are required'
      });
    }
    
    const validPurposes = ['practice', 'heal', 'learn'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purpose. Must be: practice, heal, or learn'
      });
    }
    
    if (!asanas || !Array.isArray(asanas) || asanas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Flow must contain at least one asana'
      });
    }
    
    const userProfile = {
      _id: req.user._id || req.user.id,
      diseases: req.user.profile?.diseases || [],
      injuries: req.user.profile?.injuries || []
    };
    
    const checkSafety = userRole === 'user';
    const validation = await validateFlowAsanas(asanas, checkSafety, userProfile);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }
    
    const processedAsanas = processFlowAsanas(asanas);
    const levels = extractFlowLevels(validation.asanas);
    const bodyParts = await extractFlowBodyParts(
      validation.asanas,
      userRole,
      req.user.id
    );
    
    let timeRange;
    if (estimatedTimeRange && estimatedTimeRange.min && estimatedTimeRange.max) {
      timeRange = {
        min: estimatedTimeRange.min,
        max: estimatedTimeRange.max
      };
    } else {
      timeRange = calculateEstimatedTime(processedAsanas);
    }
    
    const flow = await Flow.create({
      name,
      madeBy: userRole,
      madeById: req.user.id,
      asanas: processedAsanas,
      levels,
      bodyParts,
      estimatedTimeRange: timeRange,
      purpose,
      isPublic,
      description: description || ''
    });
    
    const populatedFlow = await Flow.findById(flow._id)
      .populate('asanas.asana', 'name level images bodyParts')
      .populate('madeById', 'name email role');
    
    res.status(201).json({
      success: true,
      message: 'Flow created successfully',
      data: { flow: populatedFlow }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create flow',
      error: error.message
    });
  }
};

const getFlows = async (req, res) => {
  try {
    const {
      purpose,
      level,
      bodyPart,
      madeBy,
      madeById,
      isPublic,
      search,
      page = 1,
      limit = 20
    } = req.query;
    
    const query = { isActive: true };
    
    if (purpose) {
      query.purpose = purpose;
    }
    
    if (level) {
      query.levels = level;
    }
    
    if (bodyPart) {
      query.bodyParts = bodyPart.toLowerCase();
    }
    
    if (madeBy) {
      query.madeBy = madeBy;
    }
    
    if (madeById) {
      query.madeById = madeById;
    }
    
    if (req.user) {
      if (isPublic === 'true') {
        query.isPublic = true;
      } else if (isPublic === 'false') {
        query.$or = [
          { isPublic: false, madeById: req.user.id },
          { isPublic: false, madeBy: 'system' }
        ];
      } else {
        query.$or = [
          { isPublic: true },
          { isPublic: false, madeById: req.user.id },
          { isPublic: false, madeBy: 'system' }
        ];
      }
    } else {
      query.isPublic = true;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const flows = await Flow.find(query)
      .populate('asanas.asana', 'name level images bodyParts')
      .populate('madeById', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    let filteredFlows = flows;
    if (req.user) {
      const userProfile = {
        _id: req.user._id || req.user.id,
        diseases: req.user.profile?.diseases || [],
        injuries: req.user.profile?.injuries || []
      };
      
      const safeFlows = [];
      for (const flow of flows) {
        const safetyCheck = await isFlowSafeForUser(flow, userProfile);
        if (safetyCheck.safe) {
          safeFlows.push(flow);
        }
      }
      filteredFlows = safeFlows;
    }
    
    const total = await Flow.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        flows: filteredFlows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flows',
      error: error.message
    });
  }
};

const getFlowById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const flow = await Flow.findById(id)
      .populate('asanas.asana', 'name level images bodyParts alignment steps notes')
      .populate('madeById', 'name email role');
    
    if (!flow || !flow.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Flow not found'
      });
    }
    
    if (!flow.isPublic && (!req.user || 
        (flow.madeById?.toString() !== req.user.id.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private flow'
      });
    }
    
    let safetyCheck = { safe: true };
    if (req.user) {
      const userProfile = {
        _id: req.user._id || req.user.id,
        diseases: req.user.profile?.diseases || [],
        injuries: req.user.profile?.injuries || []
      };
      safetyCheck = await isFlowSafeForUser(flow, userProfile);
    }
    
    res.json({
      success: true,
      data: {
        flow,
        safety: safetyCheck
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch flow',
      error: error.message
    });
  }
};

const updateFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    
    const flow = await Flow.findById(id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        message: 'Flow not found'
      });
    }
    
    if (flow.madeBy === 'system' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'System flows can only be modified by admin'
      });
    }
    
    if (flow.madeById?.toString() !== req.user.id.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own flows'
      });
    }
    
    const updateData = { ...req.body };
    
    if (updateData.asanas) {
      const userProfile = {
        _id: req.user._id || req.user.id,
        diseases: req.user.profile?.diseases || [],
        injuries: req.user.profile?.injuries || []
      };
      
      const checkSafety = userRole === 'user';
      const validation = await validateFlowAsanas(updateData.asanas, checkSafety, userProfile);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: validation.error
        });
      }
      
      updateData.asanas = processFlowAsanas(updateData.asanas);
      updateData.levels = extractFlowLevels(validation.asanas);
      updateData.bodyParts = await extractFlowBodyParts(
        validation.asanas,
        userRole,
        req.user.id
      );
      
      if (!updateData.estimatedTimeRange) {
        updateData.estimatedTimeRange = calculateEstimatedTime(updateData.asanas);
      }
    }
    
    if (updateData.purpose) {
      const validPurposes = ['practice', 'heal', 'learn'];
      if (!validPurposes.includes(updateData.purpose)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid purpose'
        });
      }
    }
    
    const updatedFlow = await Flow.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('asanas.asana', 'name level images bodyParts')
      .populate('madeById', 'name email role');
    
    res.json({
      success: true,
      message: 'Flow updated successfully',
      data: { flow: updatedFlow }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update flow',
      error: error.message
    });
  }
};

const deleteFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    
    const flow = await Flow.findById(id);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        message: 'Flow not found'
      });
    }
    
    if (flow.madeBy === 'system' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'System flows can only be deleted by admin'
      });
    }
    
    if (flow.madeById?.toString() !== req.user.id.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own flows'
      });
    }
    
    await Flow.findByIdAndUpdate(id, { isActive: false });
    
    res.json({
      success: true,
      message: 'Flow deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete flow',
      error: error.message
    });
  }
};

module.exports = {
  createFlow,
  getFlows,
  getFlowById,
  updateFlow,
  deleteFlow
};
