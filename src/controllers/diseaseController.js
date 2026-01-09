const { getAllDiseases, findOrCreateDisease } = require('../services/diseaseService');

const getDiseases = async (req, res) => {
  try {
    const diseases = await getAllDiseases();
    
    res.json({
      success: true,
      data: {
        diseases: diseases.map(d => ({
          name: d.name,
          displayName: d.displayName
        }))
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

const addDisease = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Disease name is required'
      });
    }
    
    const userRole = req.user.role;
    const userId = req.user.id;
    
    const disease = await findOrCreateDisease(name, userRole, userId);
    
    res.status(201).json({
      success: true,
      message: disease.wasNew ? 'Disease added successfully' : 'Disease already exists',
      data: {
        disease: {
          name: disease.name,
          displayName: disease.displayName
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add disease',
      error: error.message
    });
  }
};

module.exports = {
  getDiseases,
  addDisease
};
