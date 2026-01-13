# Live API Testing Guide

## Quick Start

Test your deployed API with one command:

```bash
npm run test:live
```

Or with custom URL:

```bash
API_URL=https://your-api-url.com/api npm run test:live
```

## What Gets Tested

The script automatically tests:

### 1. Basic Endpoints
- Health check
- Root endpoint

### 2. Authentication
- User registration
- User login
- Teacher registration
- Teacher login
- Admin login
- Get current user

### 3. Profile Management
- Get profile
- Update profile

### 4. Master Lists
- Get diseases
- Add disease
- Get body parts
- Add body part

### 5. Asana Management
- Get asanas list
- Get asana by ID (may prompt for ID)
- Teacher create asana

### 6. Flow Management
- Get flows list
- Get flow by ID (may prompt for ID)
- Generate practice flow
- Generate heal flow
- Generate heal flow (high injury level)

### 7. Admin Functions
- Get system stats
- Get users list

### 8. Error Handling
- Invalid login rejection
- Unauthorized access rejection

## Interactive Prompts

The script will prompt you if it needs data from MongoDB:

- **Asana ID**: If you want to test "Get Asana by ID", enter an asana ID from MongoDB
- **Flow ID**: If you want to test "Get Flow by ID", enter a flow ID from MongoDB

**You can skip these by pressing Enter** - the test will be marked as skipped.

## Getting IDs from MongoDB

### Option 1: MongoDB Atlas Web Interface
1. Go to https://cloud.mongodb.com
2. Login to your account
3. Go to your cluster → Browse Collections
4. Select `yogaflow` database
5. Browse `asanas` or `flows` collection
6. Copy an `_id` value

### Option 2: MongoDB Compass
1. Connect to your MongoDB
2. Browse `yogaflow` database
3. Open `asanas` or `flows` collection
4. Copy an `_id` value

### Option 3: Skip the Tests
- Just press Enter when prompted
- The test will be skipped
- All other tests will run normally

## Test Results

The script shows:
- ✅ **Passed**: Test successful
- ✗ **Failed**: Test failed (with error details)
- ⚠ **Skipped**: Test skipped (no data provided)

## Notes

- Tests use test users from seeded data (testuser@example.com, etc.)
- If test users don't exist, registration tests will create new ones
- All tests use the LIVE deployed API URL
- Timeout is set to 60 seconds (for free tier wake-up time)

## Troubleshooting

### "Request timeout"
- Free tier may be spinning up (takes ~50 seconds)
- Wait and try again

### "Cannot connect"
- Check your API URL is correct
- Verify deployment is live
- Check Render dashboard

### "401 Unauthorized"
- Test users may not exist
- Run seed script first, or let registration tests create users
