# Postman Collection Setup Guide

## Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `YogaFlowBackend.postman_collection.json`
4. Click **Import**

## Setup Environment Variables

The collection uses environment variables for easy configuration:

### Create Environment

1. In Postman, click **Environments** (left sidebar)
2. Click **+** to create new environment
3. Name it: `Yoga Flow Backend - Local`

### Set Variables

Add these variables:

| Variable | Initial Value | Current Value |
|----------|--------------|---------------|
| `base_url` | `http://localhost:3000/api` | `http://localhost:3000/api` |
| `auth_token` | (leave empty) | (auto-set on login) |

### Select Environment

1. Select your environment from the dropdown (top right)
2. Make sure it's active (highlighted)

## Auto-Token Management

The **Login** request automatically saves the token to the `auth_token` variable.

After logging in:
- All other requests will automatically use the token
- No need to manually copy/paste tokens

## Collection Structure

The collection is organized into folders:

1. **Authentication**
   - Register User
   - Register Teacher
   - Login (auto-saves token)
   - Get Current User (Me)

2. **Profile**
   - Get Profile
   - Update Profile

3. **Master Lists**
   - Get Diseases
   - Add Disease
   - Get Body Parts
   - Add Body Part

4. **Asanas**
   - Get Asanas (List)
   - Get Asana by ID
   - Create Asana (Teacher)
   - Update Asana
   - Delete Asana

5. **Flows**
   - Get Flows (List)
   - Get Flow by ID
   - Create Flow
   - Generate Practice Flow
   - Generate Targeted Practice Flow
   - Generate Heal Flow
   - Generate Heal Flow (High Injury Level)
   - Save Generated Flow
   - Update Flow
   - Delete Flow

6. **Admin**
   - Get System Stats
   - Get Users
   - Update User Status
   - Get All Diseases (Admin)
   - Update Disease Status
   - Get All Body Parts (Admin)
   - Update Body Part Status

## Quick Start

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Login:**
   - Go to **Authentication** → **Login**
   - Use test credentials: `testuser@example.com` / `test123`
   - Click **Send**
   - Token is automatically saved

3. **Test endpoints:**
   - Navigate to any folder
   - Click a request
   - Click **Send**

## Test Users

Use these test users (created by seed script):

- **User**: testuser@example.com / test123
- **Teacher**: testteacher@example.com / test123
- **Admin**: testadmin@example.com / test123

## Notes

- Replace `:id` variables in URLs with actual IDs from responses
- Some requests require specific roles (teacher/admin)
- Make sure server is running before testing
- Token expires after 7 days (configurable in .env)

## Troubleshooting

### Token not saving
- Check that environment is selected
- Verify Login request has the test script enabled

### 401 Unauthorized
- Token might have expired
- Re-run Login request
- Check Authorization header format: `Bearer <token>`

### 403 Forbidden
- Check user role (some endpoints require teacher/admin)
- Use appropriate test user account

### Connection Error
- Verify server is running on correct port
- Check `base_url` environment variable
- Ensure CORS is configured correctly
