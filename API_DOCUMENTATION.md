# API Documentation

Base URL: `http://localhost:3000/api` (or your configured domain)

All endpoints return JSON responses with the following structure:
```json
{
  "success": true/false,
  "message": "Description",
  "data": { ... }
}
```

---

## Authentication

### Register
**POST** `/auth/register`

Create a new user or teacher account.

**Request Body:**
```json
{
  "email": "user@example.com",  // Optional if phone provided
  "phone": "+1234567890",        // Optional if email provided
  "password": "password123",
  "role": "user"                 // "user" or "teacher"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "user",
      "profile": { ... }
    }
  }
}
```

---

### Login
**POST** `/auth/login`

Login with email or phone and password.

**Request Body:**
```json
{
  "email": "user@example.com",  // Optional if phone provided
  "phone": "+1234567890",        // Optional if email provided
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": { ... }
  }
}
```

---

### Get Current User
**GET** `/auth/me`

Get authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user",
      "profile": { ... }
    }
  }
}
```

---

## Profile Management

### Get Profile
**GET** `/profile`

Get user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "user",
      "profile": {
        "name": "John Doe",
        "level": "beginner",
        "diseases": ["asthma", "hypertension"],
        "injuries": [
          {
            "bodyPart": "lower_back",
            "level": 3,
            "description": "Mild back pain"
          }
        ],
        "bodyPartsAffected": ["lower_back"],
        "preferences": {
          "intensity": "moderate",
          "timeRange": { "min": 15, "max": 30 }
        }
      }
    }
  }
}
```

---

### Update Profile
**PUT** `/profile`

Update user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "level": "intermediate",  // child, beginner, average, intermediate, advanced, old
  "diseases": ["asthma", "diabetes"],  // Array of disease names (auto-normalized)
  "injuries": [
    {
      "bodyPart": "knee",
      "level": 5,  // 1-10
      "description": "Knee injury"
    }
  ],
  "bodyPartsAffected": ["knee", "lower_back"],
  "preferences": {
    "intensity": "light",  // light, moderate, intense
    "timeRange": { "min": 20, "max": 45 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

## Master Lists

### Get Diseases
**GET** `/diseases`

Get all available diseases (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "diseases": [
      {
        "name": "asthma",
        "displayName": "Asthma"
      },
      ...
    ]
  }
}
```

---

### Add Disease
**POST** `/diseases`

Add a new disease to the master list (normalized automatically).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Migraine"  // Auto-normalized (case-insensitive, space handling)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Disease added successfully",
  "data": {
    "disease": {
      "name": "migraine",
      "displayName": "Migraine"
    }
  }
}
```

---

### Get Body Parts
**GET** `/body-parts`

Get all available body parts (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": {
    "bodyParts": [
      {
        "name": "lower_back",
        "displayName": "Lower Back"
      },
      ...
    ]
  }
}
```

---

### Add Body Part
**POST** `/body-parts`

Add a new body part to the master list (normalized automatically).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "SI Joint"  // Auto-normalized
}
```

---

## Asanas

### Get Asanas
**GET** `/asanas`

Get list of asanas with filtering.

**Query Parameters:**
- `level` - Filter by level (child, beginner, average, intermediate, advanced, old)
- `bodyPart` - Filter by body part
- `isPrivate` - Filter private/public (true/false)
- `addedBy` - Filter by creator role
- `addedById` - Filter by creator user ID
- `search` - Search by name (case-insensitive)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Headers:**
```
Authorization: Bearer <token>  // Optional (for private asanas)
```

**Example:**
```
GET /asanas?level=beginner&bodyPart=shoulders&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asanas": [
      {
        "id": "asana_id",
        "name": "Mountain Pose",
        "level": "beginner",
        "bodyParts": ["feet", "spine"],
        "images": ["url1", "url2"],
        "alignment": { "text": "...", "images": [], ... },
        "steps": { "text": "...", ... },
        "exemptFrom": {
          "diseases": [],
          "injuries": []
        },
        "isPrivate": false,
        ...
      },
      ...
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

### Get Asana by ID
**GET** `/asanas/:id`

Get a single asana by ID.

**Headers:**
```
Authorization: Bearer <token>  // Optional (required for private asanas)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "asana": { ... },
    "safety": {
      "safe": true,  // Safety check for authenticated users
      "reason": "..."
    }
  }
}
```

---

### Create Asana
**POST** `/asanas`

Create a new asana (teacher/admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Mountain Pose",
  "level": "beginner",
  "bodyParts": ["feet", "spine"],  // Auto-normalized
  "images": ["url1", "url2"],
  "alignment": {
    "text": "Stand tall...",
    "images": [],
    "audio": "optional_url",
    "video": "optional_url"
  },
  "steps": {
    "text": "1. Stand...",
    "images": [],
    "audio": "optional_url",
    "video": "optional_url"
  },
  "exemptFrom": {
    "diseases": ["wrist_pain"],
    "injuries": [
      {
        "bodyPart": "wrist",
        "minLevel": 5
      }
    ]
  },
  "diseaseAllowed": [
    {
      "disease": "hypertension",
      "allowedLevel": 5
    }
  ],
  "isPrivate": false,
  "notes": "Additional notes"
}
```

---

### Update Asana
**PUT** `/asanas/:id`

Update an asana (owner/admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:** (Same as create, all fields optional)

---

### Delete Asana
**DELETE** `/asanas/:id`

Delete an asana (soft delete, owner/admin only).

**Headers:**
```
Authorization: Bearer <token>
```

---

## Flows

### Get Flows
**GET** `/flows`

Get list of flows with filtering.

**Query Parameters:**
- `purpose` - Filter by purpose (practice, heal, learn)
- `level` - Filter by level
- `bodyPart` - Filter by body part
- `madeBy` - Filter by creator role
- `madeById` - Filter by creator user ID
- `isPublic` - Filter public/private
- `search` - Search by name
- `page` - Page number
- `limit` - Items per page

**Headers:**
```
Authorization: Bearer <token>  // Optional (for private flows)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flows": [
      {
        "id": "flow_id",
        "name": "Morning Flow",
        "purpose": "practice",
        "asanas": [
          {
            "asana": { "id": "...", "name": "...", ... },
            "order": 1,
            "duration": 60,
            "notes": "Hold for 3 breaths"
          },
          ...
        ],
        "levels": ["beginner"],
        "bodyParts": ["shoulders", "spine"],
        "estimatedTimeRange": { "min": 15, "max": 30 },
        "isPublic": true,
        ...
      },
      ...
    ],
    "pagination": { ... }
  }
}
```

---

### Get Flow by ID
**GET** `/flows/:id`

Get a single flow by ID.

**Headers:**
```
Authorization: Bearer <token>  // Optional (required for private flows)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flow": { ... },
    "safety": {
      "safe": true,
      "reason": "..."
    }
  }
}
```

---

### Create Flow
**POST** `/flows`

Create a new flow (user/teacher/admin).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Morning Warm-up",
  "purpose": "practice",  // practice, heal, learn
  "asanas": [
    {
      "asana": "asana_id_1",
      "order": 1,
      "duration": 60,  // Optional, in seconds
      "notes": "Hold for 3 breaths"  // Optional
    },
    ...
  ],
  "estimatedTimeRange": {  // Optional, auto-calculated if not provided
    "min": 15,
    "max": 30
  },
  "isPublic": false,
  "description": "A gentle morning flow"
}
```

---

### Generate Practice Flow
**POST** `/flows/generate/practice`

Generate a practice flow based on criteria.

**Headers:**
```
Authorization: Bearer <token>  // Optional (enhanced filtering if authenticated)
```

**Request Body:**
```json
{
  "type": "full_body",  // preparatory, full_body, targeted
  "level": ["beginner", "intermediate"],  // Array or single value
  "bodyPart": "shoulders",  // Required if type="targeted"
  "timeRange": {  // Optional
    "min": 15,
    "max": 30
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Practice flow generated successfully",
  "data": {
    "existingFlows": [ ... ],  // Up to 5 matching existing flows
    "generatedFlow": {
      "name": "Full Body Flow - Beginner",
      "asanas": [ ... ],
      "levels": ["beginner"],
      "bodyParts": ["shoulders", "spine", ...],
      "estimatedTimeRange": { "min": 15, "max": 25 },
      "purpose": "practice",
      "isSaved": false,
      "note": "This flow is not saved. You can save it later if desired."
    }
  }
}
```

---

### Generate Heal Flow
**POST** `/flows/generate/heal`

Generate a healing flow (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "bodyPart": "lower_back",  // Optional
  "disease": "arthritis",     // Optional (at least one required)
  "healingStage": "beginning",
  "injury": "sprain",
  "injuryLevel": 3  // 1-10
}
```

**Response (Normal):**
```json
{
  "success": true,
  "message": "Healing flow generated successfully",
  "data": {
    "flow": {
      "name": "Lower Back Healing Flow",
      "asanas": [ ... ],
      "estimatedTimeRange": { "min": 10, "max": 30 },
      "purpose": "heal",
      "isSaved": false
    }
  }
}
```

**Response (if injuryLevel >= 5):**
```json
{
  "success": true,
  "warning": "Injury level is 5 or higher. Please rest and practice pranayama only. Consult an expert before practicing yoga.",
  "suggestion": "rest_and_pranayama",
  "data": {
    "flow": {
      "name": "Rest and Pranayama Flow",
      "asanas": [],
      "estimatedTimeRange": { "min": 10, "max": 20 },
      "purpose": "heal",
      "description": "Rest recommended. Focus on pranayama (breathing exercises) only."
    }
  }
}
```

---

### Save Generated Flow
**POST** `/flows/save-generated`

Save a generated flow to user's account.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Morning Flow",
  "asanas": [ ... ],  // From generated flow
  "purpose": "practice",
  "isPublic": false,
  "description": "..."
}
```

---

### Update Flow
**PUT** `/flows/:id`

Update a flow (owner/admin only).

**Headers:**
```
Authorization: Bearer <token>
```

---

### Delete Flow
**DELETE** `/flows/:id`

Delete a flow (owner/admin only).

**Headers:**
```
Authorization: Bearer <token>
```

---

## Admin (Admin Only)

All admin endpoints require authentication and admin role.

### Get System Stats
**GET** `/admin/stats`

Get system statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "users": 150,
      "teachers": 25,
      "asanas": 300,
      "flows": 500,
      "diseases": 15,
      "bodyParts": 24
    }
  }
}
```

---

### Get Users
**GET** `/admin/users`

Get list of users.

**Query Parameters:**
- `role` - Filter by role (user, teacher, admin)
- `isActive` - Filter by active status
- `page` - Page number
- `limit` - Items per page

---

### Update User Status
**PUT** `/admin/users/:id/status`

Activate or deactivate a user.

**Request Body:**
```json
{
  "isActive": true  // or false
}
```

---

### Get All Diseases (Admin)
**GET** `/admin/diseases`

Get all diseases with details (who added, when).

**Query Parameters:**
- `isActive` - Filter by active status
- `page` - Page number
- `limit` - Items per page

---

### Update Disease Status
**PUT** `/admin/diseases/:id/status`

Activate or deactivate a disease.

**Request Body:**
```json
{
  "isActive": true
}
```

---

### Get All Body Parts (Admin)
**GET** `/admin/body-parts`

Get all body parts with details.

**Query Parameters:**
- `isActive` - Filter by active status
- `page` - Page number
- `limit` - Items per page

---

### Update Body Part Status
**PUT** `/admin/body-parts/:id/status`

Activate or deactivate a body part.

**Request Body:**
```json
{
  "isActive": true
}
```

---

## Error Responses

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"  // Optional
}
```

### Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained from `/auth/register` or `/auth/login` endpoints.

---

## Notes

1. **Normalization**: Disease and body part names are automatically normalized (case-insensitive, space handling)
2. **Safety Filtering**: Asanas and flows are automatically filtered based on user's diseases/injuries for authenticated users
3. **Pagination**: List endpoints support pagination with `page` and `limit` query parameters
4. **Soft Delete**: Deleted items are marked as inactive, not removed from database
5. **Time Formats**: Durations are in seconds, time ranges are in minutes
