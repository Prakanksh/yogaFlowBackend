const { getAllBodyParts, findOrCreateBodyPart } = require('../services/bodyPartService');

const getBodyParts = async (req, res) => {
  try {
    const bodyParts = await getAllBodyParts();
    
    res.json({
      success: true,
      data: {
        bodyParts: bodyParts.map(bp => ({
          name: bp.name,
          displayName: bp.displayName
        }))
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

const addBodyPart = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Body part name is required'
      });
    }
    
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const bodyPart = await findOrCreateBodyPart(name, userRole, userId);
    
    res.status(201).json({
      success: true,
      message: bodyPart.wasNew ? 'Body part added successfully' : 'Body part already exists',
      data: {
        bodyPart: {
          name: bodyPart.name,
          displayName: bodyPart.displayName
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add body part',
      error: error.message
    });
  }
};

module.exports = {
  getBodyParts,
  addBodyPart
};
