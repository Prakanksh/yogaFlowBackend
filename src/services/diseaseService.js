const Disease = require('../models/Disease');
const { normalizeDiseaseName, normalizeDisplayName } = require('../utils/normalize');

const getAllDiseases = async () => {
  try {
    const diseases = await Disease.find({ isActive: true })
      .sort({ displayName: 1 })
      .select('name displayName');
    return diseases;
  } catch (error) {
    throw new Error(`Failed to fetch diseases: ${error.message}`);
  }
};

const findOrCreateDisease = async (diseaseName, addedBy = 'user', addedById = null) => {
  try {
    const normalizedName = normalizeDiseaseName(diseaseName);
    if (!normalizedName) {
      throw new Error('Invalid disease name');
    }
    
    let disease = await Disease.findOne({ name: normalizedName });
    let wasNew = false;
    
    if (!disease) {
      const displayName = normalizeDisplayName(diseaseName);
      disease = await Disease.create({
        name: normalizedName,
        displayName: displayName,
        addedBy,
        addedById
      });
      wasNew = true;
    }
    
    const diseaseObj = disease.toObject ? disease.toObject() : disease;
    diseaseObj.wasNew = wasNew;
    return diseaseObj;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - disease already exists, fetch it
      const normalizedName = normalizeDiseaseName(diseaseName);
      const disease = await Disease.findOne({ name: normalizedName });
      if (disease) {
        const diseaseObj = disease.toObject ? disease.toObject() : disease;
        diseaseObj.wasNew = false;
        return diseaseObj;
      }
    }
    throw new Error(`Failed to find or create disease: ${error.message}`);
  }
};

const processDiseaseList = async (diseaseNames, addedBy = 'user', addedById = null) => {
  try {
    if (!Array.isArray(diseaseNames) || diseaseNames.length === 0) {
      return [];
    }
    
    const normalizedDiseases = [];
    
    for (const diseaseName of diseaseNames) {
      if (typeof diseaseName !== 'string' || !diseaseName.trim()) {
        continue;
      }
      
      const disease = await findOrCreateDisease(diseaseName, addedBy, addedById);
      if (disease && disease.isActive) {
        normalizedDiseases.push(disease.name);
      }
    }
    
    return [...new Set(normalizedDiseases)];
  } catch (error) {
    throw new Error(`Failed to process disease list: ${error.message}`);
  }
};

module.exports = {
  getAllDiseases,
  findOrCreateDisease,
  processDiseaseList
};
