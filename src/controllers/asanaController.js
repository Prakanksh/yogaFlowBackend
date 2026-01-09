const Asana = require('../models/Asana');
const {
  processAsanaBodyParts,
  processAsanaExemptFrom,
  processAsanaDiseaseAllowed,
  isAsanaSafeForUser,
  filterSafeAsanas
} = require('../services/asanaService');

const createAsana = async (req, res) => {
  try {
    const userRole = req.user.role;
    
    if (userRole !== 'teacher' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers and admins can create asanas'
      });
    }
    
    const {
      name,
      images,
      alignment,
      steps,
      isPrivate = false,
      level,
      bodyParts,
      preparatoryFor,
      modifications,
      modificationTo,
      notes,
      diseaseAllowed,
      exemptFrom,
      recommendedCounterPoses
    } = req.body;
    
    if (!name || !level) {
      return res.status(400).json({
        success: false,
        message: 'Name and level are required'
      });
    }
    
    const validLevels = ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid level'
      });
    }
    
    const processedBodyParts = await processAsanaBodyParts(
      bodyParts,
      userRole,
      req.user.id
    );
    
    const processedExemptFrom = await processAsanaExemptFrom(
      exemptFrom,
      userRole,
      req.user.id
    );
    
    const processedDiseaseAllowed = await processAsanaDiseaseAllowed(
      diseaseAllowed,
      userRole,
      req.user.id
    );
    
    const asana = await Asana.create({
      name,
      images: images || [],
      alignment: alignment || {},
      steps: steps || {},
      addedBy: userRole,
      addedById: req.user.id,
      isPrivate,
      level,
      bodyParts: processedBodyParts,
      preparatoryFor: preparatoryFor || [],
      modifications: modifications || [],
      modificationTo: modificationTo || [],
      notes: notes || '',
      diseaseAllowed: processedDiseaseAllowed,
      exemptFrom: processedExemptFrom,
      recommendedCounterPoses: recommendedCounterPoses || []
    });
    
    res.status(201).json({
      success: true,
      message: 'Asana created successfully',
      data: { asana }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create asana',
      error: error.message
    });
  }
};

const getAsanas = async (req, res) => {
  try {
    const {
      level,
      bodyPart,
      isPrivate,
      addedBy,
      addedById,
      search,
      page = 1,
      limit = 20
    } = req.query;
    
    const query = { isActive: true };
    
    if (level) {
      query.level = level;
    }
    
    if (bodyPart) {
      query.bodyParts = bodyPart.toLowerCase();
    }
    
    if (addedBy) {
      query.addedBy = addedBy;
    }
    
    if (addedById) {
      query.addedById = addedById;
    }
    
    if (req.user) {
      if (isPrivate === 'true') {
        query.$or = [
          { isPrivate: false },
          { isPrivate: true, addedById: req.user.id }
        ];
      } else if (isPrivate === 'false') {
        query.isPrivate = false;
      }
    } else {
      query.isPrivate = false;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const asanas = await Asana.find(query)
      .populate('preparatoryFor', 'name level')
      .populate('modifications', 'name level')
      .populate('modificationTo', 'name level')
      .populate('recommendedCounterPoses', 'name level')
      .populate('addedById', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    let filteredAsanas = asanas;
    if (req.user) {
      const userProfile = {
        _id: req.user._id || req.user.id,
        diseases: req.user.profile?.diseases || [],
        injuries: req.user.profile?.injuries || []
      };
      filteredAsanas = filterSafeAsanas(asanas, userProfile);
    }
    
    const total = await Asana.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        asanas: filteredAsanas,
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
      message: 'Failed to fetch asanas',
      error: error.message
    });
  }
};

const getAsanaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const asana = await Asana.findById(id)
      .populate('preparatoryFor', 'name level images')
      .populate('modifications', 'name level images')
      .populate('modificationTo', 'name level images')
      .populate('recommendedCounterPoses', 'name level images')
      .populate('addedById', 'name email role');
    
    if (!asana || !asana.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Asana not found'
      });
    }
    
    if (asana.isPrivate && (!req.user || asana.addedById?.toString() !== req.user.id.toString() && req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to private asana'
      });
    }
    
    let safetyCheck = { safe: true };
    if (req.user) {
      const userProfile = {
        _id: req.user.id,
        diseases: req.user.profile?.diseases || [],
        injuries: req.user.profile?.injuries || []
      };
      safetyCheck = isAsanaSafeForUser(asana, userProfile);
    }
    
    res.json({
      success: true,
      data: {
        asana,
        safety: safetyCheck
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch asana',
      error: error.message
    });
  }
};

const updateAsana = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    
    const asana = await Asana.findById(id);
    
    if (!asana) {
      return res.status(404).json({
        success: false,
        message: 'Asana not found'
      });
    }
    
    if (asana.addedBy === 'system' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'System asanas can only be modified by admin'
      });
    }
    
    if (asana.addedById?.toString() !== req.user.id.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own asanas'
      });
    }
    
    const updateData = { ...req.body };
    
    if (updateData.bodyParts) {
      updateData.bodyParts = await processAsanaBodyParts(
        updateData.bodyParts,
        userRole,
        req.user.id
      );
    }
    
    if (updateData.exemptFrom) {
      updateData.exemptFrom = await processAsanaExemptFrom(
        updateData.exemptFrom,
        userRole,
        req.user.id
      );
    }
    
    if (updateData.diseaseAllowed) {
      updateData.diseaseAllowed = await processAsanaDiseaseAllowed(
        updateData.diseaseAllowed,
        userRole,
        req.user.id
      );
    }
    
    if (updateData.level) {
      const validLevels = ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old'];
      if (!validLevels.includes(updateData.level)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level'
        });
      }
    }
    
    const updatedAsana = await Asana.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('addedById', 'name email role');
    
    res.json({
      success: true,
      message: 'Asana updated successfully',
      data: { asana: updatedAsana }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update asana',
      error: error.message
    });
  }
};

const deleteAsana = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    
    const asana = await Asana.findById(id);
    
    if (!asana) {
      return res.status(404).json({
        success: false,
        message: 'Asana not found'
      });
    }
    
    if (asana.addedBy === 'system' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'System asanas can only be deleted by admin'
      });
    }
    
    if (asana.addedById?.toString() !== req.user.id.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own asanas'
      });
    }
    
    await Asana.findByIdAndUpdate(id, { isActive: false });
    
    res.json({
      success: true,
      message: 'Asana deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete asana',
      error: error.message
    });
  }
};

module.exports = {
  createAsana,
  getAsanas,
  getAsanaById,
  updateAsana,
  deleteAsana
};
