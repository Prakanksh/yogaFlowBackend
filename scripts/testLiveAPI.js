const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

const API_BASE_URL = process.env.API_URL || 'https://yogaflowbackend.onrender.com/api';
let authTokens = {
  user: null,
  teacher: null,
  admin: null
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

const log = (message, type = 'info') => {
  const colors = { 
    success: '\x1b[32m', 
    error: '\x1b[31m', 
    info: '\x1b[36m', 
    warning: '\x1b[33m',
    section: '\x1b[35m',
    reset: '\x1b[0m' 
  };
  const icons = { success: '✓', error: '✗', info: '→', warning: '⚠', section: '▶' };
  console.log(`${colors[type] || ''}${icons[type] || ''} ${message}${colors.reset}`);
};

const logSection = (title) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(70) + '\n');
};

const testStep = async (name, testFn, required = false) => {
  try {
    log(`Testing: ${name}`, 'info');
    const result = await testFn();
    log(`${name} - PASSED`, 'success');
    return { success: true, result, name };
  } catch (error) {
    if (required) {
      log(`${name} - FAILED: ${error.message}`, 'error');
      if (error.response) {
        log(`  Status: ${error.response.status}`, 'error');
        log(`  Response: ${JSON.stringify(error.response.data, null, 2)}`, 'error');
      }
    } else {
      log(`${name} - SKIPPED: ${error.message}`, 'warning');
    }
    return { success: false, error: error.message, name };
  }
};

// Test Functions
const testHealthCheck = async () => {
  const response = await api.get('/health', { baseURL: API_BASE_URL.replace('/api', '') });
  if (response.data.status !== 'OK') throw new Error('Health check failed');
  return response.data;
};

const testRootEndpoint = async () => {
  const response = await api.get('/', { baseURL: API_BASE_URL.replace('/api', '') });
  return response.data;
};

const testUserRegistration = async () => {
  const email = `testuser${Date.now()}@test.com`;
  const response = await api.post('/auth/register', {
    email,
    password: 'test123456',
    role: 'user'
  });
  if (!response.data.success || !response.data.data.token) {
    throw new Error('Registration failed');
  }
  authTokens.user = response.data.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  return { email, token: response.data.data.token };
};

const testTeacherRegistration = async () => {
  const email = `testteacher${Date.now()}@test.com`;
  const response = await api.post('/auth/register', {
    email,
    password: 'test123456',
    role: 'teacher'
  });
  if (!response.data.success || !response.data.data.token) {
    throw new Error('Teacher registration failed');
  }
  authTokens.teacher = response.data.data.token;
  return { email, token: response.data.data.token };
};

const testUserLogin = async () => {
  const response = await api.post('/auth/login', {
    email: 'testuser@example.com',
    password: 'test123'
  });
  if (!response.data.success || !response.data.data.token) {
    throw new Error('Login failed');
  }
  authTokens.user = response.data.data.token;
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  return response.data;
};

const testTeacherLogin = async () => {
  const response = await api.post('/auth/login', {
    email: 'testteacher@example.com',
    password: 'test123'
  });
  if (!response.data.success || !response.data.data.token) {
    throw new Error('Teacher login failed');
  }
  authTokens.teacher = response.data.data.token;
  return response.data;
};

const testAdminLogin = async () => {
  const response = await api.post('/auth/login', {
    email: 'testadmin@example.com',
    password: 'test123'
  });
  if (!response.data.success || !response.data.data.token) {
    throw new Error('Admin login failed');
  }
  authTokens.admin = response.data.data.token;
  return response.data;
};

const testGetMe = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.get('/auth/me');
  if (!response.data.success) throw new Error('Get me failed');
  return response.data;
};

const testGetProfile = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.get('/profile');
  if (!response.data.success) throw new Error('Get profile failed');
  return response.data;
};

const testUpdateProfile = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.put('/profile', {
    level: 'intermediate',
    bodyPartsAffected: ['shoulders', 'neck']
  });
  if (!response.data.success) throw new Error('Update profile failed');
  return response.data;
};

const testGetDiseases = async () => {
  const response = await api.get('/diseases');
  if (!response.data.success) throw new Error('Get diseases failed');
  return response.data;
};

const testAddDisease = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const diseaseName = `test_disease_${Date.now()}`;
  const response = await api.post('/diseases', {
    name: diseaseName
  });
  if (!response.data.success) throw new Error('Add disease failed');
  return response.data;
};

const testGetBodyParts = async () => {
  const response = await api.get('/body-parts');
  if (!response.data.success) throw new Error('Get body parts failed');
  return response.data;
};

const testAddBodyPart = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const bodyPartName = `test_part_${Date.now()}`;
  const response = await api.post('/body-parts', {
    name: bodyPartName
  });
  if (!response.data.success) throw new Error('Add body part failed');
  return response.data;
};

const testGetAsanas = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.get('/asanas?level=beginner&limit=5');
  if (!response.data.success) throw new Error('Get asanas failed');
  return response.data;
};

const testGetAsanaById = async (asanaId) => {
  if (!asanaId) {
    log('  ⚠ Need asana ID from MongoDB to test this', 'warning');
    const id = await question('  Enter asana ID from MongoDB (or press Enter to skip): ');
    if (!id.trim()) return { skipped: true };
    asanaId = id.trim();
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.get(`/asanas/${asanaId}`);
  if (!response.data.success) throw new Error('Get asana by ID failed');
  return response.data;
};

const testTeacherCreateAsana = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.teacher}`;
  const response = await api.post('/asanas', {
    name: `Test Asana ${Date.now()}`,
    level: 'beginner',
    bodyParts: ['shoulders'],
    exemptFrom: {
      diseases: [],
      injuries: []
    }
  });
  if (!response.data.success) throw new Error('Create asana failed');
  return response.data;
};

const testGetFlows = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.get('/flows?purpose=practice&limit=5');
  if (!response.data.success) throw new Error('Get flows failed');
  return response.data;
};

const testGetFlowById = async (flowId) => {
  if (!flowId) {
    log('  ⚠ Need flow ID from MongoDB to test this', 'warning');
    const id = await question('  Enter flow ID from MongoDB (or press Enter to skip): ');
    if (!id.trim()) return { skipped: true };
    flowId = id.trim();
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.get(`/flows/${flowId}`);
  if (!response.data.success) throw new Error('Get flow by ID failed');
  return response.data;
};

const testGeneratePracticeFlow = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.post('/flows/generate/practice', {
    type: 'full_body',
    level: ['beginner'],
    timeRange: { min: 15, max: 30 }
  });
  if (!response.data.success) throw new Error('Generate practice flow failed');
  return response.data;
};

const testGenerateHealFlow = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.post('/flows/generate/heal', {
    bodyPart: 'lower_back',
    healingStage: 'beginning',
    injuryLevel: 2
  });
  if (!response.data.success && !response.data.warning) {
    throw new Error('Generate heal flow failed');
  }
  return response.data;
};

const testGenerateHealFlowHighInjury = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.user}`;
  const response = await api.post('/flows/generate/heal', {
    bodyPart: 'knee',
    injuryLevel: 7
  });
  if (!response.data.success && !response.data.warning) {
    throw new Error('Generate heal flow (high injury) failed');
  }
  return response.data;
};

const testAdminGetStats = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.admin}`;
  const response = await api.get('/admin/stats');
  if (!response.data.success) throw new Error('Admin get stats failed');
  return response.data;
};

const testAdminGetUsers = async () => {
  api.defaults.headers.common['Authorization'] = `Bearer ${authTokens.admin}`;
  const response = await api.get('/admin/users?limit=5');
  if (!response.data.success) throw new Error('Admin get users failed');
  return response.data;
};

const testErrorCases = async () => {
  log('Testing error cases...', 'info');
  
  // Test invalid login
  try {
    await api.post('/auth/login', {
      email: 'invalid@test.com',
      password: 'wrong'
    });
    throw new Error('Should have failed');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('  Invalid login correctly rejected', 'success');
    } else {
      throw error;
    }
  }
  
  // Test unauthorized access
  try {
    await api.get('/admin/stats');
    throw new Error('Should have failed');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('  Unauthorized access correctly rejected', 'success');
    } else {
      throw error;
    }
  }
  
  return { success: true };
};

const runComprehensiveTests = async () => {
  logSection('COMPREHENSIVE LIVE API TEST SUITE');
  log(`Testing API at: ${API_BASE_URL}\n`, 'info');
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    tests: []
  };

  try {
    // Basic Tests
    logSection('1. BASIC ENDPOINTS');
    let result = await testStep('Health Check', testHealthCheck, true);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Root Endpoint', testRootEndpoint, true);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Authentication Tests
    logSection('2. AUTHENTICATION');
    result = await testStep('User Registration', testUserRegistration, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('User Login', testUserLogin, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Teacher Registration', testTeacherRegistration, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Teacher Login', testTeacherLogin, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Admin Login', testAdminLogin, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Get Current User (Me)', testGetMe, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Profile Tests
    logSection('3. PROFILE MANAGEMENT');
    result = await testStep('Get Profile', testGetProfile, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Update Profile', testUpdateProfile, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Master Lists Tests
    logSection('4. MASTER LISTS');
    result = await testStep('Get Diseases', testGetDiseases, true);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Add Disease', testAddDisease, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Get Body Parts', testGetBodyParts, true);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Add Body Part', testAddBodyPart, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Asana Tests
    logSection('5. ASANA MANAGEMENT');
    result = await testStep('Get Asanas (List)', testGetAsanas, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Get Asana by ID', () => testGetAsanaById(), false);
    results.tests.push(result);
    if (result.success) results.passed++;
    else if (result.result?.skipped) results.skipped++;
    else results.failed++;
    
    result = await testStep('Teacher Create Asana', testTeacherCreateAsana, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Flow Tests
    logSection('6. FLOW MANAGEMENT');
    result = await testStep('Get Flows (List)', testGetFlows, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Get Flow by ID', () => testGetFlowById(), false);
    results.tests.push(result);
    if (result.success) results.passed++;
    else if (result.result?.skipped) results.skipped++;
    else results.failed++;
    
    result = await testStep('Generate Practice Flow', testGeneratePracticeFlow, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Generate Heal Flow', testGenerateHealFlow, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Generate Heal Flow (High Injury Level)', testGenerateHealFlowHighInjury, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Admin Tests
    logSection('7. ADMIN FUNCTIONS');
    result = await testStep('Admin Get Stats', testAdminGetStats, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;
    
    result = await testStep('Admin Get Users', testAdminGetUsers, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Error Handling Tests
    logSection('8. ERROR HANDLING');
    result = await testStep('Error Cases (Invalid Login, Unauthorized)', testErrorCases, false);
    results.tests.push(result);
    if (result.success) results.passed++; else results.failed++;

    // Summary
    logSection('TEST SUMMARY');
    log(`Total Tests: ${results.passed + results.failed + results.skipped}`, 'info');
    log(`Passed: ${results.passed}`, 'success');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'error' : 'success');
    log(`Skipped: ${results.skipped}`, results.skipped > 0 ? 'warning' : 'info');
    
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
  }
};

const main = async () => {
  console.log('\n🚀 Starting Comprehensive Live API Test Suite\n');
  console.log(`API URL: ${API_BASE_URL}\n`);
  
  log('Note: Some tests may prompt you for MongoDB data (IDs)', 'info');
  log('You can skip those by pressing Enter\n', 'info');
  
  await runComprehensiveTests();
};

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runComprehensiveTests };
