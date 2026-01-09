const Asana = require('../models/Asana');
const Flow = require('../models/Flow');
const { isAsanaSafeForUser, filterSafeAsanas } = require('./asanaService');
const { extractFlowLevels, extractFlowBodyParts, processFlowAsanas, calculateEstimatedTime } = require('./flowService');

const findMatchingExistingFlows = async (criteria, userProfile) => {
  const {
    purpose,
    level,
    bodyPart,
    timeRange
  } = criteria;
  
  const query = {
    isActive: true,
    purpose: purpose || 'practice'
  };
  
  if (level && Array.isArray(level) && level.length > 0) {
    query.levels = { $in: level };
  } else if (level) {
    query.levels = level;
  }
  
  if (bodyPart) {
    query.bodyParts = bodyPart.toLowerCase();
  }
  
  if (timeRange && timeRange.min && timeRange.max) {
    query.$or = [
      {
        'estimatedTimeRange.min': { $gte: timeRange.min },
        'estimatedTimeRange.max': { $lte: timeRange.max }
      },
      {
        'estimatedTimeRange.min': { $gte: timeRange.min, $lte: timeRange.max }
      },
      {
        'estimatedTimeRange.max': { $gte: timeRange.min, $lte: timeRange.max }
      }
    ];
  }
  
  let flows = await Flow.find(query)
    .populate('asanas.asana')
    .sort({ createdAt: -1 })
    .limit(10);
  
  if (userProfile) {
    flows = flows.filter(flow => {
      if (flow.isPublic) return true;
      if (flow.madeById?.toString() === userProfile._id?.toString()) return true;
      if (flow.madeBy === 'system') return true;
      return false;
    });
  } else {
    flows = flows.filter(flow => flow.isPublic);
  }
  
  return flows;
};

const generatePracticeFlow = async (criteria, userProfile) => {
  const {
    type = 'full_body',
    level = ['beginner'],
    bodyPart = null,
    timeRange = null
  } = criteria;
  
  let query = {
    isActive: true
  };
  
  if (Array.isArray(level) && level.length > 0) {
    query.level = { $in: level };
  } else {
    query.level = level || 'beginner';
  }
  
  if (type === 'targeted' && bodyPart) {
    query.bodyParts = bodyPart.toLowerCase();
  } else if (type === 'preparatory') {
    query.preparatoryFor = { $exists: true, $ne: [] };
  }
  
  let asanas = await Asana.find(query)
    .populate('preparatoryFor', 'name level')
    .limit(50);
  
  if (userProfile) {
    asanas = filterSafeAsanas(asanas, userProfile);
  }
  
  if (asanas.length === 0) {
    return { error: 'No suitable asanas found for the given criteria' };
  }
  
  const selectedAsanaIds = selectAsanasForFlow(asanas, type, timeRange);
  
  if (selectedAsanaIds.length === 0) {
    return { error: 'Could not generate a flow with the given criteria' };
  }
  
  const selectedAsanas = asanas.filter(a => selectedAsanaIds.includes(a._id.toString()));
  const processedAsanas = processFlowAsanas(selectedAsanaIds.map(id => ({ asana: id })));
  const levels = extractFlowLevels(selectedAsanas);
  const bodyParts = await extractFlowBodyParts(
    selectedAsanas,
    'system',
    null
  );
  const estimatedTime = calculateEstimatedTime(processedAsanas);
  
  if (timeRange) {
    if (estimatedTime.min < timeRange.min || estimatedTime.max > timeRange.max) {
      const adjusted = adjustAsanasForTimeRange(processedAsanas, timeRange);
      if (adjusted.length < processedAsanas.length) {
        return {
          error: `Could not generate a flow within ${timeRange.min}-${timeRange.max} minutes. Minimum time: ${estimatedTime.min} minutes.`
        };
      }
    }
  }
  
  return {
    name: generateFlowName(type, level, bodyPart),
    asanas: processedAsanas,
    levels,
    bodyParts,
    estimatedTimeRange: estimatedTime,
    purpose: 'practice',
    description: generateFlowDescription(type, level, bodyPart)
  };
};

const generateHealFlow = async (criteria, userProfile) => {
  if (!userProfile) {
    return { error: 'User profile required for heal flow generation' };
  }
  
  const {
    bodyPart = null,
    disease = null,
    healingStage = 'beginning',
    injury = null,
    injuryLevel = null
  } = criteria;
  
  if (!bodyPart && !disease) {
    return { error: 'At least one of bodyPart or disease must be provided' };
  }
  
  if (injuryLevel !== null && injuryLevel >= 5) {
    return {
      warning: 'Injury level is 5 or higher. Please rest and practice pranayama only. Consult an expert before practicing yoga.',
      suggestion: 'rest_and_pranayama',
      flow: {
        name: 'Rest and Pranayama Flow',
        asanas: [],
        levels: [],
        bodyParts: [],
        estimatedTimeRange: { min: 10, max: 20 },
        purpose: 'heal',
        description: 'Rest recommended. Focus on pranayama (breathing exercises) only.'
      }
    };
  }
  
  let query = {
    isActive: true,
    level: { $in: ['beginner', 'average'] }
  };
  
  if (bodyPart) {
    query.bodyParts = bodyPart.toLowerCase();
  }
  
  let asanas = await Asana.find(query)
    .populate('preparatoryFor', 'name level')
    .limit(50);
  
  if (userProfile) {
    asanas = filterSafeAsanas(asanas, userProfile);
  }
  
  if (disease) {
    const normalizedDisease = disease.toLowerCase().trim().replace(/\s+/g, '_');
    asanas = asanas.filter(asana => {
      if (asana.exemptFrom?.diseases?.includes(normalizedDisease)) {
        return false;
      }
      if (asana.diseaseAllowed && asana.diseaseAllowed.length > 0) {
        const allowed = asana.diseaseAllowed.some(
          item => item.disease === normalizedDisease
        );
        if (!allowed) {
          return false;
        }
      }
      return true;
    });
  }
  
  if (asanas.length === 0) {
    return { error: 'No safe asanas found for healing based on your profile' };
  }
  
  const selectedAsanaIds = selectHealingAsanas(asanas, healingStage, bodyPart, injuryLevel);
  
  if (selectedAsanaIds.length === 0) {
    return { error: 'Could not generate a healing flow for the given criteria' };
  }
  
  const selectedAsanas = asanas.filter(a => selectedAsanaIds.includes(a._id.toString()));
  const processedAsanas = processFlowAsanas(selectedAsanaIds.map(id => ({ asana: id })));
  const levels = extractFlowLevels(selectedAsanas);
  const bodyParts = await extractFlowBodyParts(
    selectedAsanas,
    'system',
    null
  );
  const estimatedTime = calculateEstimatedTime(processedAsanas);
  
  return {
    name: generateHealFlowName(bodyPart, disease, healingStage),
    asanas: processedAsanas,
    levels,
    bodyParts,
    estimatedTimeRange: { min: Math.max(estimatedTime.min, 10), max: Math.min(estimatedTime.max, 30) },
    purpose: 'heal',
    description: generateHealFlowDescription(bodyPart, disease, healingStage, injuryLevel)
  };
};

const selectAsanasForFlow = (asanas, type, timeRange) => {
  const selected = [];
  const usedIds = new Set();
  
  if (type === 'preparatory') {
    const preparatoryAsanas = asanas.filter(a => a.preparatoryFor && a.preparatoryFor.length > 0);
    selected.push(...preparatoryAsanas.slice(0, 5).map(a => a._id.toString()));
  } else {
    const warmupCount = 2;
    const mainCount = type === 'full_body' ? 6 : 4;
    const cooldownCount = 2;
    
    const levels = ['beginner', 'average', 'intermediate'];
    const byLevel = {};
    asanas.forEach(a => {
      if (!byLevel[a.level]) byLevel[a.level] = [];
      byLevel[a.level].push(a);
    });
    
    for (let i = 0; i < warmupCount && selected.length < warmupCount; i++) {
      const level = levels[i % levels.length];
      const candidates = (byLevel[level] || []).filter(a => !usedIds.has(a._id.toString()));
      if (candidates.length > 0) {
        const asana = candidates[Math.floor(Math.random() * candidates.length)];
        selected.push(asana._id.toString());
        usedIds.add(asana._id.toString());
      }
    }
    
    for (let i = 0; i < mainCount && selected.length < warmupCount + mainCount; i++) {
      const level = levels[i % levels.length];
      const candidates = (byLevel[level] || []).filter(a => !usedIds.has(a._id.toString()));
      if (candidates.length > 0) {
        const asana = candidates[Math.floor(Math.random() * candidates.length)];
        selected.push(asana._id.toString());
        usedIds.add(asana._id.toString());
      }
    }
    
    for (let i = 0; i < cooldownCount && selected.length < warmupCount + mainCount + cooldownCount; i++) {
      const level = levels[i % levels.length];
      const candidates = (byLevel[level] || []).filter(a => !usedIds.has(a._id.toString()));
      if (candidates.length > 0) {
        const asana = candidates[Math.floor(Math.random() * candidates.length)];
        selected.push(asana._id.toString());
        usedIds.add(asana._id.toString());
      }
    }
  }
  
  return selected;
};

const selectHealingAsanas = (asanas, healingStage, bodyPart, injuryLevel) => {
  const selected = [];
  const usedIds = new Set();
  
  const gentleAsanas = asanas.filter(a => 
    a.level === 'beginner' || a.level === 'average'
  );
  
  if (gentleAsanas.length === 0) {
    return [];
  }
  
  const maxAsanas = injuryLevel && injuryLevel >= 3 ? 3 : 5;
  
  for (let i = 0; i < Math.min(maxAsanas, gentleAsanas.length); i++) {
    const candidates = gentleAsanas.filter(a => !usedIds.has(a._id.toString()));
    if (candidates.length === 0) break;
    
    const asana = candidates[Math.floor(Math.random() * candidates.length)];
    selected.push(asana._id.toString());
    usedIds.add(asana._id.toString());
  }
  
  return selected;
};

const adjustAsanasForTimeRange = (processedAsanas, timeRange) => {
  const targetMinutes = (timeRange.min + timeRange.max) / 2;
  const maxSeconds = targetMinutes * 60;
  
  let currentSeconds = 0;
  const adjusted = [];
  
  for (const item of processedAsanas) {
    const duration = item.duration || 60;
    if (currentSeconds + duration <= maxSeconds) {
      adjusted.push(item);
      currentSeconds += duration;
    } else {
      break;
    }
  }
  
  return adjusted;
};

const generateFlowName = (type, level, bodyPart) => {
  const typeMap = {
    'preparatory': 'Preparatory',
    'full_body': 'Full Body',
    'targeted': bodyPart ? `${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} Focused` : 'Targeted'
  };
  
  const levelStr = Array.isArray(level) ? level[0] : level;
  return `${typeMap[type] || 'Yoga'} Flow - ${levelStr.charAt(0).toUpperCase() + levelStr.slice(1)}`;
};

const generateFlowDescription = (type, level, bodyPart) => {
  const typeDesc = {
    'preparatory': 'A preparatory flow to warm up your body',
    'full_body': 'A complete full body practice',
    'targeted': bodyPart ? `Focus on ${bodyPart}` : 'A targeted practice'
  };
  
  return typeDesc[type] || 'A personalized yoga flow';
};

const generateHealFlowName = (bodyPart, disease, healingStage) => {
  let name = 'Healing Flow';
  if (bodyPart) {
    name = `${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} Healing Flow`;
  } else if (disease) {
    name = `${disease.charAt(0).toUpperCase() + disease.slice(1)} Healing Flow`;
  }
  return name;
};

const generateHealFlowDescription = (bodyPart, disease, healingStage, injuryLevel) => {
  let desc = 'A gentle healing practice';
  if (bodyPart) {
    desc += ` focusing on ${bodyPart}`;
  }
  if (disease) {
    desc += ` for ${disease}`;
  }
  if (injuryLevel && injuryLevel >= 3) {
    desc += '. Practice gently and listen to your body.';
  }
  return desc;
};

const generateLearnFlow = async (criteria, userProfile) => {
  return {
    error: 'Learn flow generation is not yet implemented',
    placeholder: true
  };
};

module.exports = {
  findMatchingExistingFlows,
  generatePracticeFlow,
  generateHealFlow,
  generateLearnFlow
};
