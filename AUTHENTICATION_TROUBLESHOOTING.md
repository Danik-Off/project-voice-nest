# Authentication Troubleshooting Guide

## Problem: "Invalid credentials" error (401)

### Root Cause
The database is empty - there are no registered users. You cannot login without first registering a user account.

### Solution

#### Option 1: Use the Admin Account (Recommended)

An admin account is automatically created on first application startup with these default credentials:
- **Email**: `admin@example.com`
- **Password**: `Admin123456`

**Login Request:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin123456"
}
```

For more information about admin account setup, see [ADMIN_SETUP.md](ADMIN_SETUP.md).

#### Option 2: Register a new user
Before you can login, you need to create a user account via the registration endpoint.

**Request:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Step 3: Login with the registered credentials
After successful registration, you can login with the same credentials.

**Request:**
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "isActive": true
  }
}
```

#### Step 4: Use the token for authenticated requests
Include the token in the Authorization header for protected endpoints:

```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Common Issues and Solutions

### 1. Wrong Email or Password
**Error:** `{"message":"Invalid credentials","error":"Unauthorized","statusCode":401}`

**Solution:** 
- Verify you're using the exact email and password used during registration
- Check for typos in the email address
- Passwords are case-sensitive

### 2. User is Blocked/Inactive
**Error:** `{"message":"User is blocked","error":"Unauthorized","statusCode":401}`

**Solution:**
- Contact an administrator to unblock your account
- Check if your account's `isActive` field is set to `true` in the database

### 3. User Not Found
**Error:** `{"message":"Invalid credentials","error":"Unauthorized","statusCode":401}`

**Solution:**
- Ensure you've registered the user first
- Check that the email exists in the database

## Testing with Swagger UI

You can test authentication using the built-in Swagger UI:

1. Navigate to `http://localhost:5000/api`
2. Click on the **Auth** section
3. Expand **POST /api/auth/register**
4. Click **Try it out**
5. Enter registration details and click **Execute**
6. Copy the returned token
7. Expand **POST /api/auth/login**
8. Click **Try it out**, enter credentials, and click **Execute**
9. For protected endpoints, click the **Authorize** button at the top
10. Enter `Bearer YOUR_TOKEN` and click **Authorize**

## Database Verification

To check if users exist in the database, you can run:

```bash
# Using Node.js (create a temporary script)
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('database.sqlite'); db.all('SELECT id, username, email, isActive FROM users', (err, rows) => { console.log(rows); db.close(); });"
```

## Quick Setup with Seed Scripts

### Create Admin User
```bash
npm run seed:admin
```

### Create Test User
```bash
npm run seed:user
```

These scripts will:
- Check if the user already exists
- Create the user if it doesn't exist
- Display the login credentials
- Show any errors if they occur

### Custom Admin Credentials

You can customize admin credentials using environment variables:

```bash
# Windows (cmd.exe)
set ADMIN_EMAIL=custom@example.com && set ADMIN_USERNAME=customadmin && set ADMIN_PASSWORD=CustomPass123 && npm run seed:admin

# Windows (PowerShell)
$env:ADMIN_EMAIL="custom@example.com"; $env:ADMIN_USERNAME="customadmin"; $env:ADMIN_PASSWORD="CustomPass123"; npm run seed:admin

# Linux/Mac
ADMIN_EMAIL=custom@example.com ADMIN_USERNAME=customadmin ADMIN_PASSWORD=CustomPass123 npm run seed:admin
```

Or set them permanently in your `.env` file:
```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_USERNAME=youradmin
ADMIN_PASSWORD=YourSecurePassword123
```

## Security Notes

- Always use strong passwords (minimum 8 characters, mix of letters, numbers, and symbols)
- The JWT_SECRET in `.env` should be changed from the default value in production
- Never commit `.env` file to version control
- Use HTTPS in production environments

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login with credentials | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Request/Response Formats

#### Register Request
```json
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

#### Login Request
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

#### Login Response
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string",
    "role": "user|moderator|admin",
    "isActive": "boolean"
  }
}
```

## Development Tips

1. **Reset Database:** If you need to start fresh, delete `database.sqlite` and restart the server
2. **Seed Data:** Consider creating a seed script to populate test users
3. **Logging:** Check server logs for detailed error messages
4. **Environment:** Ensure `.env` file exists with proper configuration

## Getting Help

If you continue to experience issues:

1. Check the server console for detailed error logs
2. Verify the database connection is working
3. Ensure the server is running on the correct port (default: 5000)
4. Review the API documentation at `http://localhost:5000/api`
