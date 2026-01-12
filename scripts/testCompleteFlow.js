const axios = require('axios');
const readline = require('readline');
const { seedTestData, connectDB } = require('./seedTestData');
const mongoose = require('mongoose');

require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
let authToken = null;
let testData = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const log = (message, type = 'info') => {
  const icons = { success: '✓', error: '✗', info: '→', warning: '⚠' };
  const colors = { success: '\x1b[32m', error: '\x1b[31m', info: '\x1b[36m', warning: '\x1b[33m', reset: '\x1b[0m' };
  console.log(`${colors[type] || ''}${icons[type] || ''} ${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
};

const testStep = async (name, testFn) => {
  try {
    log(`Testing: ${name}`, 'info');
    const result = await testFn();
    log(`${name} - PASSED`, 'success');
    return { success: true, result };
  } catch (error) {
    log(`${name} - FAILED: ${error.message}`, 'error');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'error');
      log(`  Response: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
    }
    return { success: false, error: error.message };
  }
};

// Test Functions
const testUserRegistration = async () => {
  const response = await api.post('/auth/register', {
    email: 'newuser@test.com',
    password: 'test123456',
    role: 'user'
  });
  
  if (!response.data.success || !response.data.data.token) {
    throw new Error('Registration failed - no token received');
  }
  
  authToken = response.data.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  return response.data;
};

const testUserLogin = async () => {
  const response = await api.post('/auth/login', {
    email: 'testuser@example.com',
    password: 'test123'
  });
  
  if (!response.data.success || !response.data.data.token) {
    throw new Error('Login failed');
  }
  
  authToken = response.data.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  return response.data;
};

const testGetProfile = async () => {
  const response = await api.get('/profile');
  if (!response.data.success) throw new Error('Failed to get profile');
  return response.data;
};

const testUpdateProfile = async () => {
  const response = await api.put('/profile', {
    level: 'intermediate',
    bodyPartsAffected: ['shoulders', 'neck']
  });
  if (!response.data.success) throw new Error('Failed to update profile');
  return response.data;
};

const testGetDiseases = async () => {
  const response = await api.get('/diseases');
  if (!response.data.success) throw new Error('Failed to get diseases');
  return response.data;
};

const testGetBodyParts = async () => {
  const response = await api.get('/body-parts');
  if (!response.data.success) throw new Error('Failed to get body parts');
  return response.data;
};

const testGetAsanas = async () => {
  const response = await api.get('/asanas?level=beginner&limit=5');
  if (!response.data.success) throw new Error('Failed to get asanas');
  return response.data;
};

const testGetAsanaById = async (asanaId) => {
  const response = await api.get(`/asanas/${asanaId}`);
  if (!response.data.success) throw new Error('Failed to get asana');
  return response.data;
};

const testGetFlows = async () => {
  const response = await api.get('/flows?purpose=practice&limit=5');
  if (!response.data.success) throw new Error('Failed to get flows');
  return response.data;
};

const testGeneratePracticeFlow = async () => {
  const response = await api.post('/flows/generate/practice', {
    type: 'full_body',
    level: ['beginner'],
    timeRange: { min: 15, max: 30 }
  });
  if (!response.data.success) throw new Error('Failed to generate practice flow');
  return response.data;
};

const testGenerateHealFlow = async () => {
  const response = await api.post('/flows/generate/heal', {
    bodyPart: 'lower_back',
    healingStage: 'beginning',
    injuryLevel: 2
  });
  if (!response.data.success && !response.data.warning) {
    throw new Error('Failed to generate heal flow');
  }
  return response.data;
};

const testTeacherCreateAsana = async () => {
  // Login as teacher
  const loginResponse = await api.post('/auth/login', {
    email: 'testteacher@example.com',
    password: 'test123'
  });
  const teacherToken = loginResponse.data.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${teacherToken}`;

  const response = await api.post('/asanas', {
    name: 'Test Asana',
    level: 'beginner',
    bodyParts: ['shoulders'],
    exemptFrom: {
      diseases: [],
      injuries: []
    }
  });
  if (!response.data.success) throw new Error('Failed to create asana');
  return response.data;
};

const testAdminGetStats = async () => {
  // Login as admin
  const loginResponse = await api.post('/auth/login', {
    email: 'testadmin@example.com',
    password: 'test123'
  });
  const adminToken = loginResponse.data.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

  const response = await api.get('/admin/stats');
  if (!response.data.success) throw new Error('Failed to get admin stats');
  return response.data;
};

const testAdminGetUsers = async () => {
  const response = await api.get('/admin/users?limit=5');
  if (!response.data.success) throw new Error('Failed to get users');
  return response.data;
};

const runTests = async () => {
  logSection('AUTOMATED BACKEND TEST SUITE');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    // Step 1: Seed Database
    logSection('STEP 1: Database Seeding');
    await connectDB();
    testData = await seedTestData();
    log('Database seeded with test data', 'success');
    await mongoose.connection.close();

    // Wait a moment for server to be ready
    log('\n⏳ Waiting 2 seconds for server to be ready...', 'info');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Authentication Tests
    logSection('STEP 2: Authentication Tests');
    
    let result = await testStep('User Registration', testUserRegistration);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    result = await testStep('User Login', testUserLogin);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    result = await testStep('Get Current User (Me)', async () => {
      const response = await api.get('/auth/me');
      if (!response.data.success) throw new Error('Failed to get current user');
      return response.data;
    });
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Step 3: Profile Management Tests
    logSection('STEP 3: Profile Management Tests');
    
    result = await testStep('Get Profile', testGetProfile);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    result = await testStep('Update Profile', testUpdateProfile);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Step 4: Master Lists Tests
    logSection('STEP 4: Master Lists (Diseases & Body Parts)');
    
    result = await testStep('Get Diseases', testGetDiseases);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    result = await testStep('Get Body Parts', testGetBodyParts);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Step 5: Asana Tests
    logSection('STEP 5: Asana Management Tests');
    
    result = await testStep('Get Asanas (List)', testGetAsanas);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    if (testData && testData.asanas && testData.asanas.length > 0) {
      const asanaId = testData.asanas[0]._id.toString();
      result = await testStep('Get Asana by ID', () => testGetAsanaById(asanaId));
      results.tests.push(result);
      if (result.success) results.passed++; else results.failed++;
    }

    result = await testStep('Teacher Create Asana', testTeacherCreateAsana);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Step 6: Flow Tests
    logSection('STEP 6: Flow Management Tests');
    
    result = await testStep('Get Flows (List)', testGetFlows);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    result = await testStep('Generate Practice Flow', testGeneratePracticeFlow);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    result = await testStep('Generate Heal Flow', testGenerateHealFlow);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Step 7: Admin Tests
    logSection('STEP 7: Admin Tests');
    
    result = await testStep('Admin Get Stats', testAdminGetStats);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    result = await testStep('Admin Get Users', testAdminGetUsers);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Final Summary
    logSection('TEST SUMMARY');
    log(`Total Tests: ${results.passed + results.failed}`, 'info');
    log(`Passed: ${results.passed}`, 'success');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
    
    if (results.failed === 0) {
      log('\n🎉 ALL TESTS PASSED!', 'success');
    } else {
      log('\n⚠️  SOME TESTS FAILED', 'warning');
    }

  } catch (error) {
    log(`\n✗ Fatal error: ${error.message}`, 'error');
    console.error(error);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

const main = async () => {
  console.log('\n🚀 Starting Backend Test Suite\n');
  console.log(`API Base URL: ${API_BASE_URL}\n`);
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    log('⚠️  Server not responding. Please start the server first:', 'warning');
    log('   npm run dev', 'info');
    log('\nDo you want to continue anyway? (y/n)', 'info');
    const answer = await question('');
    if (answer.toLowerCase() !== 'y') {
      process.exit(1);
    }
  } else {
    log('✓ Server is running', 'success');
  }

  await runTests();
};

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
