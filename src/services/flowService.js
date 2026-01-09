const Flow = require('../models/Flow');
const Asana = require('../models/Asana');
const { processBodyPartList } = require('./bodyPartService');
const { isAsanaSafeForUser, filterSafeAsanas } = require('./asanaService');

const validateFlowAsanas = async (asanas, checkSafety = false, userProfile = null) => {
  if (!asanas || !Array.isArray(asanas)) {
    return { valid: false, error: 'Asanas must be an array' };
  }
  
  if (asanas.length === 0) {
    return { valid: false, error: 'Flow must contain at least one asana' };
  }
  
  const asanaIds = asanas.map(item => 
    typeof item === 'object' ? item.asana : item
  ).filter(id => id != null);
  
  if (asanaIds.length === 0) {
    return { valid: false, error: 'No valid asana IDs provided' };
  }
  
  const uniqueAsanaIds = [...new Set(asanaIds.map(id => id.toString()))];
  if (uniqueAsanaIds.length !== asanaIds.length) {
    return { valid: false, error: 'Duplicate asanas are not allowed in a flow' };
  }
  
  const existingAsanas = await Asana.find({
    _id: { $in: asanaIds },
    isActive: true
  });
  
  if (existingAsanas.length !== uniqueAsanaIds.length) {
    return { valid: false, error: 'One or more asanas not found or inactive' };
  }
  
  if (checkSafety && userProfile) {
    const safeAsanas = filterSafeAsanas(existingAsanas, userProfile);
    if (safeAsanas.length !== existingAsanas.length) {
      return { 
        valid: false, 
        error: 'One or more asanas are not safe for the user based on their profile' 
      };
    }
  }
  
  return { valid: true, asanas: existingAsanas };
};

const processFlowAsanas = (asanas) => {
  if (!asanas || !Array.isArray(asanas)) {
    return [];
  }
  
  return asanas.map((item, index) => {
    if (typeof item === 'object' && item.asana) {
      return {
        asana: item.asana,
        order: item.order !== undefined ? item.order : index + 1,
        duration: item.duration || null,
        notes: item.notes || ''
      };
    } else {
      return {
        asana: item,
        order: index + 1,
        duration: null,
        notes: ''
      };
    }
  }).sort((a, b) => a.order - b.order);
};

const extractFlowLevels = (asanas) => {
  if (!asanas || asanas.length === 0) {
    return [];
  }
  
  const levels = new Set();
  asanas.forEach(asana => {
    if (asana.level) {
      levels.add(asana.level);
    }
  });
  
  return Array.from(levels);
};

const extractFlowBodyParts = async (asanas, addedBy, addedById) => {
  if (!asanas || asanas.length === 0) {
    return [];
  }
  
  const bodyPartsSet = new Set();
  asanas.forEach(asana => {
    if (asana.bodyParts && Array.isArray(asana.bodyParts)) {
      asana.bodyParts.forEach(bp => bodyPartsSet.add(bp));
    }
  });
  
  const bodyPartsArray = Array.from(bodyPartsSet);
  if (bodyPartsArray.length === 0) {
    return [];
  }
  
  return await processBodyPartList(bodyPartsArray, addedBy, addedById);
};

const calculateEstimatedTime = (asanas) => {
  let totalMin = 0;
  let totalMax = 0;
  
  asanas.forEach(item => {
    if (item.duration) {
      totalMin += item.duration;
      totalMax += item.duration;
    } else {
      totalMin += 60;
      totalMax += 90;
    }
  });
  
  return {
    min: Math.round(totalMin / 60),
    max: Math.round(totalMax / 60)
  };
};

const isFlowSafeForUser = async (flow, userProfile) => {
  if (!flow || !userProfile) {
    return { safe: false, reason: 'Missing data' };
  }
  
  if (!flow.isActive) {
    return { safe: false, reason: 'Flow is inactive' };
  }
  
  if (!flow.asanas || flow.asanas.length === 0) {
    return { safe: false, reason: 'Flow has no asanas' };
  }
  
  const asanaIds = flow.asanas.map(item => item.asana);
  const asanas = await Asana.find({ _id: { $in: asanaIds } });
  
  for (const asana of asanas) {
    const safetyCheck = isAsanaSafeForUser(asana, userProfile);
    if (!safetyCheck.safe) {
      return { 
        safe: false, 
        reason: `Asana "${asana.name}" is not safe: ${safetyCheck.reason}` 
      };
    }
  }
  
  return { safe: true };
};

module.exports = {
  validateFlowAsanas,
  processFlowAsanas,
  extractFlowLevels,
  extractFlowBodyParts,
  calculateEstimatedTime,
  isFlowSafeForUser
};
