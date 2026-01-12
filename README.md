# Yoga Flow Backend

Backend API for Yoga Practice Application built with Node.js, Express.js, and MongoDB.

## Features

- ✅ User & Teacher authentication with JWT
- ✅ Role-based access control (user, teacher, admin)
- ✅ User profile management with diseases, injuries, body parts
- ✅ Disease & Body Part master lists with auto-normalization
- ✅ Asana CRUD with safety filtering (disease/injury logic)
- ✅ Flow CRUD with public/private visibility
- ✅ Dynamic flow generation (Practice & Heal)
- ✅ Admin minimal controls
- ✅ Comprehensive test suite

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

3. Run the server:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

## Testing

### Automated Testing
```bash
# Run complete test suite (seeds database + runs tests)
npm run test:full

# Run tests only (if data already exists)
npm run test

# Seed database only
npm run seed
```

See [TESTING.md](./TESTING.md) for detailed testing instructions.

## Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[Testing Guide](./TESTING.md)** - Testing instructions and test data

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Helper functions
└── server.js        # Entry point

scripts/
├── seedTestData.js      # Database seeding script
└── testCompleteFlow.js  # Automated test suite
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user/teacher
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

### Master Lists
- `GET /api/diseases` - Get diseases
- `POST /api/diseases` - Add disease
- `GET /api/body-parts` - Get body parts
- `POST /api/body-parts` - Add body part

### Asanas
- `GET /api/asanas` - List asanas
- `GET /api/asanas/:id` - Get asana
- `POST /api/asanas` - Create asana (teacher/admin)
- `PUT /api/asanas/:id` - Update asana
- `DELETE /api/asanas/:id` - Delete asana

### Flows
- `GET /api/flows` - List flows
- `GET /api/flows/:id` - Get flow
- `POST /api/flows` - Create flow
- `POST /api/flows/generate/practice` - Generate practice flow
- `POST /api/flows/generate/heal` - Generate heal flow
- `POST /api/flows/save-generated` - Save generated flow
- `PUT /api/flows/:id` - Update flow
- `DELETE /api/flows/:id` - Delete flow

### Admin
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - List users
- `PUT /api/admin/users/:id/status` - Update user status
- `GET /api/admin/diseases` - List all diseases
- `PUT /api/admin/diseases/:id/status` - Update disease status
- `GET /api/admin/body-parts` - List all body parts
- `PUT /api/admin/body-parts/:id/status` - Update body part status

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed documentation.

## Test Users

Default test users (created by seed script):
- **User**: testuser@example.com / test123
- **Teacher**: testteacher@example.com / test123
- **Admin**: testadmin@example.com / test123
