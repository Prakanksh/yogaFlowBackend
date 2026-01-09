const Disease = require('../models/Disease');
const { normalizeDiseaseName, normalizeDisplayName } = require('./normalize');

const defaultDiseases = [
  'hypertension',
  'diabetes',
  'asthma',
  'arthritis',
  'back pain',
  'knee pain',
  'neck pain',
  'osteoporosis',
  'pregnancy',
  'heart disease',
  'anxiety',
  'depression'
];

const seedDefaultDiseases = async () => {
  try {
    console.log('Seeding default diseases...');
    
    for (const diseaseName of defaultDiseases) {
      const normalizedName = normalizeDiseaseName(diseaseName);
      const existingDisease = await Disease.findOne({ name: normalizedName });
      
      if (!existingDisease) {
        await Disease.create({
          name: normalizedName,
          displayName: normalizeDisplayName(diseaseName),
          addedBy: 'system',
          addedById: null,
          isActive: true
        });
        console.log(`Added disease: ${normalizeDisplayName(diseaseName)}`);
      }
    }
    
    console.log('Default diseases seeded successfully');
  } catch (error) {
    console.error('Error seeding diseases:', error.message);
    throw error;
  }
};

module.exports = { seedDefaultDiseases };
