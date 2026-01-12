const User = require('../models/User');
const Disease = require('../models/Disease');
const BodyPart = require('../models/BodyPart');
const Asana = require('../models/Asana');
const Flow = require('../models/Flow');

const getUsers = async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        users,
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
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot modify admin user status'
      });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const [usersCount, teachersCount, asanasCount, flowsCount, diseasesCount, bodyPartsCount] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'teacher', isActive: true }),
      Asana.countDocuments({ isActive: true }),
      Flow.countDocuments({ isActive: true }),
      Disease.countDocuments({ isActive: true }),
      BodyPart.countDocuments({ isActive: true })
    ]);
    
    res.json({
      success: true,
      data: {
        stats: {
          users: usersCount,
          teachers: teachersCount,
          asanas: asanasCount,
          flows: flowsCount,
          diseases: diseasesCount,
          bodyParts: bodyPartsCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system stats',
      error: error.message
    });
  }
};

const updateDiseaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }
    
    const disease = await Disease.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!disease) {
      return res.status(404).json({
        success: false,
        message: 'Disease not found'
      });
    }
    
    res.json({
      success: true,
      message: `Disease ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { disease }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update disease status',
      error: error.message
    });
  }
};

const updateBodyPartStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }
    
    const bodyPart = await BodyPart.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    
    if (!bodyPart) {
      return res.status(404).json({
        success: false,
        message: 'Body part not found'
      });
    }
    
    res.json({
      success: true,
      message: `Body part ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { bodyPart }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update body part status',
      error: error.message
    });
  }
};

const getAllDiseases = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const diseases = await Disease.find(query)
      .populate('addedById', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Disease.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        diseases,
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
      message: 'Failed to fetch diseases',
      error: error.message
    });
  }
};

const getAllBodyParts = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const bodyParts = await BodyPart.find(query)
      .populate('addedById', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await BodyPart.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        bodyParts,
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
      message: 'Failed to fetch body parts',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  updateUserStatus,
  getSystemStats,
  updateDiseaseStatus,
  updateBodyPartStatus,
  getAllDiseases,
  getAllBodyParts
};
