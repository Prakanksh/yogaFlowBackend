# Yoga Flow Backend - Project Summary

## Overview

Complete backend API for a Yoga Practice Application that generates personalized yoga flows based on user profiles, health conditions, and preferences.

## Architecture

- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Language**: Node.js
- **Structure**: Clean, modular architecture (MVC-like pattern)

## Core Features

### 1. Authentication & Authorization
- User/Teacher registration (email or phone)
- JWT-based authentication
- Role-based access control (user, teacher, admin)
- Profile management

### 2. User Profiles
- Level tracking (child, beginner, intermediate, advanced, old)
- Disease management (master list with normalization)
- Injury tracking (body part + severity level 1-10)
- Body parts affected
- Preferences (time range, intensity)

### 3. Master Lists
- **Diseases**: Normalized master list (users can add new diseases)
- **Body Parts**: Normalized master list (users can add new body parts)
- Auto-normalization (case-insensitive, space handling)
- Shared across all users

### 4. Asanas (Yoga Poses)
- Complete CRUD operations
- Safety filtering based on diseases/injuries
- `exemptFrom` logic (diseases/injuries that exclude asana)
- `diseaseAllowed` logic (specific diseases at specific levels)
- Body parts association
- Preparatory/modification relationships
- Public/private visibility

### 5. Flows (Yoga Sessions)
- Complete CRUD operations
- Ordered sequence of asanas
- Purpose types: practice, heal, learn
- Public/private visibility
- Auto-extracted metadata (levels, body parts, time estimation)

### 6. Dynamic Flow Generation
- **Practice Flow**: Generates flows based on type, level, body part, time range
- **Heal Flow**: Generates healing flows with injury level checks
  - Level ≥ 5: Recommends rest + pranayama
- **Learn Flow**: Placeholder for future implementation
- Returns matching existing flows + newly generated flow
- Generated flows not saved by default

### 7. Admin Controls
- Minimal admin functionality
- User management (view, activate/deactivate)
- System statistics
- Disease/Body part management
- Master list moderation

## Project Structure

```
src/
├── config/          # Configuration (database, env)
├── controllers/     # Request handlers
│   ├── authController.js
│   ├── profileController.js
│   ├── asanaController.js
│   ├── flowController.js
│   ├── flowGenerationController.js
│   ├── diseaseController.js
│   ├── bodyPartController.js
│   └── adminController.js
├── middleware/      # Custom middleware
│   ├── auth.js           # JWT authentication
│   ├── optionalAuth.js   # Optional authentication
│   ├── errorHandler.js   # Error handling
│   ├── validator.js      # Request validation
│   └── security.js       # Security headers
├── models/          # Mongoose models
│   ├── User.js
│   ├── Asana.js
│   ├── Flow.js
│   ├── Disease.js
│   └── BodyPart.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── asanaRoutes.js
│   ├── flowRoutes.js
│   ├── diseaseRoutes.js
│   ├── bodyPartRoutes.js
│   └── adminRoutes.js
├── services/        # Business logic
│   ├── asanaService.js
│   ├── flowService.js
│   ├── flowGenerationService.js
│   ├── diseaseService.js
│   └── bodyPartService.js
├── utils/           # Helper functions
│   ├── normalize.js
│   ├── validators.js
│   ├── seedDiseases.js
│   └── seedBodyParts.js
└── server.js        # Entry point

scripts/
├── seedTestData.js      # Database seeding
└── testCompleteFlow.js  # Automated tests
```

## Key Design Decisions

### Master List Pattern
- Diseases and body parts stored in separate collections
- Normalized names for consistency
- Users/teachers can add to master lists
- Shared across entire system

### Safety-First Approach
- Asanas filtered based on user diseases/injuries
- Flow generation respects safety constraints
- Injury level ≥ 5 triggers rest recommendation
- `exemptFrom` and `diseaseAllowed` logic for precision

### Clean Architecture
- Separation of concerns (routes → controllers → services)
- Reusable services
- Middleware for cross-cutting concerns
- Consistent error handling

### Production Ready
- Error handling middleware
- Request validation
- Security headers
- Logging
- Enhanced CORS
- Environment-based configuration

## API Endpoints

**Total**: 30+ endpoints across 7 main categories:
- Authentication (4 endpoints)
- Profile (2 endpoints)
- Master Lists (4 endpoints)
- Asanas (5 endpoints)
- Flows (10 endpoints)
- Flow Generation (3 endpoints)
- Admin (7 endpoints)

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete reference.

## Testing

- **Automated Test Suite**: 14 tests covering all major flows
- **Test Data Seeding**: Automatic database seeding
- **Coverage**: Authentication, Profile, Asanas, Flows, Admin
- **Run**: `npm run test:full`

## Documentation

- **API Documentation**: Complete endpoint reference
- **Testing Guide**: Testing instructions
- **Deployment Guide**: Production deployment steps
- **Production Readiness**: Security and best practices
- **Postman Collection**: Ready-to-import API collection

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: validator
- **Logging**: morgan
- **Security**: helmet, cors
- **HTTP Client**: axios (for tests)

## Development Workflow

1. **Local Development**:
   ```bash
   npm install
   npm run dev  # Starts server with nodemon
   ```

2. **Testing**:
   ```bash
   npm run test:full  # Seed + test
   npm run test       # Test only
   npm run seed       # Seed only
   ```

3. **Production**:
   ```bash
   npm start  # Runs server.js
   ```

## Status

✅ **Complete and Production-Ready**

- All core features implemented
- Comprehensive testing
- Complete documentation
- Production-ready security
- Deployment guides
- Postman collection

## Next Steps (Optional)

- Frontend development (React)
- Additional features (learn flow generation, image uploads)
- Advanced monitoring and analytics
- Rate limiting
- Caching layer
