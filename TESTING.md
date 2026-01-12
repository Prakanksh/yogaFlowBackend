# Testing Guide

## Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm run dev
```
The server will start on `http://localhost:3000` (or your configured PORT).

### Step 3: Run Complete Test Suite
In a **new terminal window**, run:
```bash
npm run test:full
```

This will:
1. Seed the database with test data
2. Run all API endpoint tests
3. Show detailed results

## What Gets Tested

The test script automatically tests:

### ✅ Authentication Flow
- User registration
- User login
- Get current user (me)

### ✅ Profile Management
- Get user profile
- Update user profile

### ✅ Master Lists
- Get diseases
- Get body parts

### ✅ Asana Management
- List asanas
- Get asana by ID
- Teacher creates asana

### ✅ Flow Management
- List flows
- Generate practice flow
- Generate heal flow

### ✅ Admin Functions
- Get system stats
- List users

## Test Data Created

The script creates:
- **3 Users**: testuser@example.com, testteacher@example.com, testadmin@example.com (all password: `test123`)
- **Default Diseases**: 12 diseases (asthma, hypertension, etc.)
- **Default Body Parts**: 24 body parts (neck, shoulders, etc.)
- **5 Test Asanas**: Mountain Pose, Child's Pose, Downward Dog, Warrior I, Cat-Cow
- **1 Test Flow**: Morning Warm-up Flow (by teacher)

## Manual Testing

### Test Users:
- **User**: testuser@example.com / test123
- **Teacher**: testteacher@example.com / test123  
- **Admin**: testadmin@example.com / test123

### Using Postman/Thunder Client:

1. **Register/Login**:
   ```
   POST /api/auth/register
   POST /api/auth/login
   ```

2. **Use Token**:
   Add header: `Authorization: Bearer <token>`

3. **Test Endpoints**:
   - GET /api/profile
   - GET /api/asanas
   - POST /api/flows/generate/practice
   - etc.

## Troubleshooting

### Server not running
```
⚠️  Server not responding. Please start the server first:
   npm run dev
```

### Database connection error
- Check your `.env` file has correct `MONGODB_URI`
- Ensure MongoDB is accessible

### Tests failing
- Check server logs for errors
- Verify database has been seeded
- Check that test users exist

## Notes

- Tests are **non-destructive** - they don't delete existing data
- Tests use **minimal input** - all data is seeded automatically
- Test script checks if server is running before starting
- All tests show color-coded results (green = pass, red = fail)
