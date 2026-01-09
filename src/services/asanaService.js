const Asana = require('../models/Asana');
const { processBodyPartList, processBodyPartMap } = require('./bodyPartService');
const { processDiseaseList } = require('./diseaseService');

const isAsanaSafeForUser = (asana, userProfile) => {
  if (!asana || !userProfile) {
    return { safe: false, reason: 'Missing data' };
  }
  
  if (!asana.isActive) {
    return { safe: false, reason: 'Asana is inactive' };
  }
  
  const userDiseases = userProfile.diseases || [];
  const userInjuries = userProfile.injuries || [];
  
  if (asana.exemptFrom && asana.exemptFrom.diseases) {
    for (const exemptDisease of asana.exemptFrom.diseases) {
      if (userDiseases.includes(exemptDisease)) {
        return { 
          safe: false, 
          reason: `User has ${exemptDisease} which this asana is exempt from` 
        };
      }
    }
  }
  
  if (asana.exemptFrom && asana.exemptFrom.injuries) {
    for (const userInjury of userInjuries) {
      for (const exemptInjury of asana.exemptFrom.injuries) {
        if (userInjury.bodyPart === exemptInjury.bodyPart) {
          const injuryLevel = userInjury.level || 0;
          const minLevel = exemptInjury.minLevel || 1;
          if (injuryLevel >= minLevel) {
            return { 
              safe: false, 
              reason: `User has injury at ${userInjury.bodyPart} with level ${injuryLevel}, asana exempts from level ${minLevel}` 
            };
          }
        }
      }
    }
  }
  
  if (asana.diseaseAllowed && asana.diseaseAllowed.length > 0) {
    let hasAllowedDisease = false;
    for (const allowed of asana.diseaseAllowed) {
      if (userDiseases.includes(allowed.disease)) {
        hasAllowedDisease = true;
        break;
      }
    }
    
    if (userDiseases.length > 0 && !hasAllowedDisease) {
      return { 
        safe: false, 
        reason: 'User has diseases not in the allowed list for this asana' 
      };
    }
  }
  
  return { safe: true };
};

const filterSafeAsanas = (asanas, userProfile) => {
  if (!userProfile) {
    return asanas.filter(asana => !asana.isPrivate && asana.isActive);
  }
  
  const userId = userProfile._id?.toString() || userProfile.toString();
  
  return asanas.filter(asana => {
    if (asana.isPrivate) {
      const asanaOwnerId = asana.addedById?._id?.toString() || asana.addedById?.toString();
      if (asanaOwnerId !== userId) {
        return false;
      }
    }
    
    const safetyCheck = isAsanaSafeForUser(asana, userProfile);
    return safetyCheck.safe;
  });
};

const processAsanaBodyParts = async (bodyParts, addedBy, addedById) => {
  if (!bodyParts || !Array.isArray(bodyParts)) {
    return [];
  }
  return await processBodyPartList(bodyParts, addedBy, addedById);
};

const processAsanaExemptFrom = async (exemptFrom, addedBy, addedById) => {
  if (!exemptFrom) {
    return { diseases: [], injuries: [] };
  }
  
  const processed = {
    diseases: [],
    injuries: []
  };
  
  if (exemptFrom.diseases && Array.isArray(exemptFrom.diseases)) {
    processed.diseases = await processDiseaseList(exemptFrom.diseases, addedBy, addedById);
  }
  
  if (exemptFrom.injuries && Array.isArray(exemptFrom.injuries)) {
    for (const injury of exemptFrom.injuries) {
      if (injury.bodyPart) {
        const normalizedBodyParts = await processBodyPartList(
          [injury.bodyPart],
          addedBy,
          addedById
        );
        if (normalizedBodyParts.length > 0) {
          processed.injuries.push({
            bodyPart: normalizedBodyParts[0],
            minLevel: injury.minLevel || 1
          });
        }
      }
    }
  }
  
  return processed;
};

const processAsanaDiseaseAllowed = async (diseaseAllowed, addedBy, addedById) => {
  if (!diseaseAllowed || !Array.isArray(diseaseAllowed)) {
    return [];
  }
  
  const processed = [];
  for (const item of diseaseAllowed) {
    if (item.disease) {
      const normalizedDiseases = await processDiseaseList(
        [item.disease],
        addedBy,
        addedById
      );
      if (normalizedDiseases.length > 0 && item.allowedLevel) {
        processed.push({
          disease: normalizedDiseases[0],
          allowedLevel: item.allowedLevel
        });
      }
    }
  }
  
  return processed;
};

module.exports = {
  isAsanaSafeForUser,
  filterSafeAsanas,
  processAsanaBodyParts,
  processAsanaExemptFrom,
  processAsanaDiseaseAllowed
};
