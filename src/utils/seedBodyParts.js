const BodyPart = require('../models/BodyPart');
const { normalizeBodyPart, normalizeDisplayName } = require('./normalize');

const defaultBodyParts = [
  'neck',
  'shoulders',
  'upper back',
  'middle back',
  'lower back',
  'spine',
  'chest',
  'hips',
  'pelvis',
  'glutes',
  'thighs',
  'knees',
  'calves',
  'ankles',
  'feet',
  'wrists',
  'elbows',
  'arms',
  'hands',
  'fingers',
  'hamstrings',
  'quadriceps',
  'abdominals',
  'core'
];

const seedDefaultBodyParts = async () => {
  try {
    console.log('Seeding default body parts...');
    
    for (const bodyPartName of defaultBodyParts) {
      const normalizedName = normalizeBodyPart(bodyPartName);
      const existingBodyPart = await BodyPart.findOne({ name: normalizedName });
      
      if (!existingBodyPart) {
        await BodyPart.create({
          name: normalizedName,
          displayName: normalizeDisplayName(bodyPartName),
          addedBy: 'system',
          addedById: null,
          isActive: true
        });
        console.log(`Added body part: ${normalizeDisplayName(bodyPartName)}`);
      }
    }
    
    console.log('Default body parts seeded successfully');
  } catch (error) {
    console.error('Error seeding body parts:', error.message);
    throw error;
  }
};

module.exports = { seedDefaultBodyParts };
