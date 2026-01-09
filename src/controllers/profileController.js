const User = require('../models/User');
const { processDiseaseList } = require('../services/diseaseService');
const { processBodyPartList, processBodyPartMap } = require('../services/bodyPartService');

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;
    const userRole = req.user.role;
    
    const profileUpdates = {};
    
    if (updates.name !== undefined) {
      profileUpdates['profile.name'] = updates.name;
    }
    
    if (updates.level !== undefined) {
      const validLevels = ['child', 'beginner', 'average', 'intermediate', 'advanced', 'old'];
      if (!validLevels.includes(updates.level)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid level. Must be one of: child, beginner, average, intermediate, advanced, old'
        });
      }
      profileUpdates['profile.level'] = updates.level;
    }
    
    if (updates.diseases !== undefined) {
      if (Array.isArray(updates.diseases)) {
        try {
          const normalizedDiseases = await processDiseaseList(
            updates.diseases, 
            userRole, 
            userId
          );
          profileUpdates['profile.diseases'] = normalizedDiseases;
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Diseases must be an array'
        });
      }
    }
    
    if (updates.injuries !== undefined) {
      if (Array.isArray(updates.injuries)) {
        try {
          for (const injury of updates.injuries) {
            if (!injury.bodyPart || injury.level === undefined || injury.level === null) {
              throw new Error('Each injury must have bodyPart and level (1-10)');
            }
            if (injury.level < 1 || injury.level > 10) {
              throw new Error('Injury level must be between 1 and 10');
            }
          }
          
          const bodyPartNames = updates.injuries.map(injury => injury.bodyPart);
          const normalizedBodyPartsMap = await processBodyPartMap(bodyPartNames, userRole, userId);
          
          const normalizedInjuries = updates.injuries.map(injury => {
            const normalizedBodyPart = normalizedBodyPartsMap[injury.bodyPart];
            if (!normalizedBodyPart) {
              throw new Error(`Invalid body part: ${injury.bodyPart}`);
            }
            return {
              bodyPart: normalizedBodyPart,
              level: injury.level,
              description: injury.description || undefined
            };
          });
          
          profileUpdates['profile.injuries'] = normalizedInjuries;
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      }
    }
    
    if (updates.bodyPartsAffected !== undefined) {
      if (Array.isArray(updates.bodyPartsAffected)) {
        try {
          const normalizedBodyParts = await processBodyPartList(
            updates.bodyPartsAffected,
            userRole,
            userId
          );
          profileUpdates['profile.bodyPartsAffected'] = normalizedBodyParts;
        } catch (error) {
          return res.status(400).json({
            success: false,
            message: error.message
          });
        }
      }
    }
    
    if (updates.preferences !== undefined) {
      if (updates.preferences.timeRange) {
        profileUpdates['profile.preferences.timeRange'] = updates.preferences.timeRange;
      }
      if (updates.preferences.intensity) {
        const validIntensities = ['light', 'moderate', 'intense'];
        if (!validIntensities.includes(updates.preferences.intensity)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid intensity. Must be light, moderate, or intense'
          });
        }
        profileUpdates['profile.preferences.intensity'] = updates.preferences.intensity;
      }
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: profileUpdates },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile: user.profile
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

module.exports = {
  updateProfile,
  getProfile
};
