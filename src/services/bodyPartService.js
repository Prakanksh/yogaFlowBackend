const BodyPart = require('../models/BodyPart');
const { normalizeBodyPart, normalizeDisplayName } = require('../utils/normalize');

const getAllBodyParts = async () => {
  try {
    const bodyParts = await BodyPart.find({ isActive: true })
      .sort({ displayName: 1 })
      .select('name displayName');
    return bodyParts;
  } catch (error) {
    throw new Error(`Failed to fetch body parts: ${error.message}`);
  }
};

const findOrCreateBodyPart = async (bodyPartName, addedBy = 'user', addedById = null) => {
  try {
    const normalizedName = normalizeBodyPart(bodyPartName);
    if (!normalizedName) {
      throw new Error('Invalid body part name');
    }
    
    let bodyPart = await BodyPart.findOne({ name: normalizedName });
    let wasNew = false;
    
    if (!bodyPart) {
      const displayName = normalizeDisplayName(bodyPartName);
      bodyPart = await BodyPart.create({
        name: normalizedName,
        displayName: displayName,
        addedBy,
        addedById
      });
      wasNew = true;
    }
    
    const bodyPartObj = bodyPart.toObject ? bodyPart.toObject() : bodyPart;
    bodyPartObj.wasNew = wasNew;
    return bodyPartObj;
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error - body part already exists, fetch it
      const normalizedName = normalizeBodyPart(bodyPartName);
      const bodyPart = await BodyPart.findOne({ name: normalizedName });
      if (bodyPart) {
        const bodyPartObj = bodyPart.toObject ? bodyPart.toObject() : bodyPart;
        bodyPartObj.wasNew = false;
        return bodyPartObj;
      }
    }
    throw new Error(`Failed to find or create body part: ${error.message}`);
  }
};

const processBodyPartList = async (bodyPartNames, addedBy = 'user', addedById = null) => {
  try {
    if (!Array.isArray(bodyPartNames) || bodyPartNames.length === 0) {
      return [];
    }
    
    const normalizedBodyParts = [];
    const seen = new Set();
    
    for (const bodyPartName of bodyPartNames) {
      if (typeof bodyPartName !== 'string' || !bodyPartName.trim()) {
        continue;
      }
      
      const bodyPart = await findOrCreateBodyPart(bodyPartName, addedBy, addedById);
      if (bodyPart && bodyPart.isActive && !seen.has(bodyPart.name)) {
        normalizedBodyParts.push(bodyPart.name);
        seen.add(bodyPart.name);
      }
    }
    
    return normalizedBodyParts;
  } catch (error) {
    throw new Error(`Failed to process body part list: ${error.message}`);
  }
};

const processBodyPartMap = async (bodyPartNames, addedBy = 'user', addedById = null) => {
  try {
    if (!Array.isArray(bodyPartNames) || bodyPartNames.length === 0) {
      return {};
    }
    
    const bodyPartMap = {};
    const uniqueNames = [...new Set(bodyPartNames)];
    
    for (const bodyPartName of uniqueNames) {
      if (typeof bodyPartName !== 'string' || !bodyPartName.trim()) {
        continue;
      }
      
      const bodyPart = await findOrCreateBodyPart(bodyPartName, addedBy, addedById);
      if (bodyPart && bodyPart.isActive) {
        bodyPartMap[bodyPartName] = bodyPart.name;
      }
    }
    
    return bodyPartMap;
  } catch (error) {
    throw new Error(`Failed to process body part map: ${error.message}`);
  }
};

module.exports = {
  getAllBodyParts,
  findOrCreateBodyPart,
  processBodyPartList,
  processBodyPartMap
};
