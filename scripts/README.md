# Test Scripts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure your `.env` file is configured with:
   - MONGODB_URI
   - JWT_SECRET
   - PORT (default: 3000)

3. Start the server:
```bash
npm run dev
```

## Running Tests

### Option 1: Run Complete Test Suite (Recommended)
This will seed the database and run all tests:
```bash
npm run test:full
```

### Option 2: Run Tests Only (if data already exists)
```bash
npm run test
```

### Option 3: Seed Data Only
```bash
npm run seed
```

## What the Test Script Does

1. **Seeds Database** with test data:
   - 3 test users (user, teacher, admin)
   - Default diseases and body parts
   - 5 test asanas
   - 1 test flow

2. **Runs Complete Flow Tests**:
   - Authentication (register, login, get me)
   - Profile management (get, update)
   - Master lists (diseases, body parts)
   - Asana management (list, get by ID, create)
   - Flow management (list, generate practice, generate heal)
   - Admin functions (stats, users)

## Test Data

Default test users:
- **User**: testuser@example.com / test123
- **Teacher**: testteacher@example.com / test123
- **Admin**: testadmin@example.com / test123

## Notes

- The script checks if the server is running before starting tests
- Tests use minimal input - all data is seeded automatically
- Test results are displayed with color-coded output
- Failed tests show detailed error messages
