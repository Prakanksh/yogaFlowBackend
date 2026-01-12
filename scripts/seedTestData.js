const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../src/models/User');
const Disease = require('../src/models/Disease');
const BodyPart = require('../src/models/BodyPart');
const Asana = require('../src/models/Asana');
const Flow = require('../src/models/Flow');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const seedTestData = async () => {
  try {
    console.log('\n🌱 Seeding test data...\n');

    // Clear existing test data (optional - comment out if you want to keep data)
    // await User.deleteMany({});
    // await Disease.deleteMany({});
    // await BodyPart.deleteMany({});
    // await Asana.deleteMany({});
    // await Flow.deleteMany({});

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠ Data already exists. Skipping seed.\n');
      return { users: [], diseases: [], bodyParts: [], asanas: [], flows: [] };
    }

    // Seed Diseases (using seedDiseases utility)
    const { seedDefaultDiseases } = require('../src/utils/seedDiseases');
    await seedDefaultDiseases();
    const diseases = await Disease.find({ isActive: true });
    console.log(`✓ Seeded ${diseases.length} diseases`);

    // Seed Body Parts (using seedBodyParts utility)
    const { seedDefaultBodyParts } = require('../src/utils/seedBodyParts');
    await seedDefaultBodyParts();
    const bodyParts = await BodyPart.find({ isActive: true });
    console.log(`✓ Seeded ${bodyParts.length} body parts`);

    // Create test users (diseases and body parts are already normalized)
    const testUsers = [
      {
        email: 'testuser@example.com',
        password: 'test123',
        role: 'user',
        profile: {
          name: 'Test User',
          level: 'beginner',
          diseases: ['asthma', 'hypertension'], // Already normalized
          injuries: [
            { bodyPart: 'lower_back', level: 3, description: 'Mild back pain' } // Already normalized
          ],
          bodyPartsAffected: ['lower_back'], // Already normalized
          preferences: {
            intensity: 'moderate',
            timeRange: { min: 15, max: 30 }
          }
        }
      },
      {
        email: 'testteacher@example.com',
        password: 'test123',
        role: 'teacher',
        profile: {
          name: 'Test Teacher',
          level: 'intermediate'
        }
      },
      {
        email: 'testadmin@example.com',
        password: 'test123',
        role: 'admin',
        profile: {
          name: 'Test Admin',
          level: 'advanced'
        }
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`✓ Created ${user.role}: ${user.email}`);
    }

    // Create test asanas
    const testAsanas = [
      {
        name: 'Mountain Pose (Tadasana)',
        level: 'beginner',
        bodyParts: ['feet', 'spine', 'core'],
        addedBy: 'system',
        diseaseAllowed: [
          { disease: 'hypertension', allowedLevel: 5 }
        ],
        exemptFrom: {
          diseases: [],
          injuries: []
        },
        images: [],
        alignment: { text: 'Stand tall with feet together' },
        steps: { text: '1. Stand with feet together\n2. Lengthen your spine\n3. Relax your shoulders' }
      },
      {
        name: 'Child\'s Pose (Balasana)',
        level: 'beginner',
        bodyParts: ['hips', 'lower_back', 'shoulders'],
        addedBy: 'system',
        diseaseAllowed: [],
        exemptFrom: {
          diseases: [],
          injuries: [
            { bodyPart: 'knee', minLevel: 5 }
          ]
        },
        images: [],
        alignment: { text: 'Kneel and sit back on heels' },
        steps: { text: '1. Kneel on the floor\n2. Sit back on your heels\n3. Fold forward' }
      },
      {
        name: 'Downward Facing Dog (Adho Mukha Svanasana)',
        level: 'average',
        bodyParts: ['shoulders', 'upper_back', 'hamstrings', 'calves'],
        addedBy: 'system',
        diseaseAllowed: [],
        exemptFrom: {
          diseases: ['wrist_pain'],
          injuries: [
            { bodyPart: 'wrist', minLevel: 3 },
            { bodyPart: 'shoulder', minLevel: 5 }
          ]
        },
        images: [],
        alignment: { text: 'Invert V-shape with hands and feet' },
        steps: { text: '1. Start on hands and knees\n2. Tuck toes\n3. Lift hips up and back' }
      },
      {
        name: 'Warrior I (Virabhadrasana I)',
        level: 'intermediate',
        bodyParts: ['hips', 'thighs', 'calves', 'core'],
        addedBy: 'system',
        diseaseAllowed: [],
        exemptFrom: {
          diseases: [],
          injuries: [
            { bodyPart: 'knee', minLevel: 4 }
          ]
        },
        images: [],
        alignment: { text: 'Lunge position with arms raised' },
        steps: { text: '1. Step one foot forward\n2. Bend front knee\n3. Raise arms overhead' }
      },
      {
        name: 'Cat-Cow Pose (Marjaryasana-Bitilasana)',
        level: 'beginner',
        bodyParts: ['spine', 'upper_back', 'lower_back'],
        addedBy: 'system',
        diseaseAllowed: [],
        exemptFrom: {
          diseases: [],
          injuries: []
        },
        images: [],
        alignment: { text: 'On hands and knees, alternate arching and rounding back' },
        steps: { text: '1. Start on hands and knees\n2. Arch back (cow)\n3. Round back (cat)' }
      }
    ];

    const createdAsanas = [];
    for (const asanaData of testAsanas) {
      const asana = await Asana.create(asanaData);
      createdAsanas.push(asana);
      console.log(`✓ Created asana: ${asana.name}`);
    }

    // Create test flow (by teacher)
    if (createdAsanas.length >= 3) {
      const teacher = createdUsers.find(u => u.role === 'teacher');
      const testFlow = {
        name: 'Morning Warm-up Flow',
        madeBy: 'teacher',
        madeById: teacher._id,
        asanas: [
          { asana: createdAsanas[0]._id, order: 1, duration: 60 },
          { asana: createdAsanas[4]._id, order: 2, duration: 90 },
          { asana: createdAsanas[1]._id, order: 3, duration: 120 }
        ],
        levels: ['beginner'],
        bodyParts: ['spine', 'lower_back', 'hips'],
        estimatedTimeRange: { min: 5, max: 8 },
        purpose: 'practice',
        isPublic: true
      };

      const flow = await Flow.create(testFlow);
      console.log(`✓ Created flow: ${flow.name}`);
      
      return {
        users: createdUsers,
        diseases,
        bodyParts,
        asanas: createdAsanas,
        flows: [flow]
      };
    }

    return {
      users: createdUsers,
      diseases,
      bodyParts,
      asanas: createdAsanas,
      flows: []
    };

  } catch (error) {
    console.error('✗ Error seeding data:', error.message);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  try {
    const data = await seedTestData();
    console.log('\n✅ Test data seeding completed!\n');
    await mongoose.connection.close();
    return data;
  } catch (error) {
    console.error('\n✗ Seeding failed:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}

module.exports = { seedTestData, connectDB };
