# Admin Account Setup Guide

This guide explains how to set up and use the admin account in ProjectVoice.

## Overview

The admin account is automatically created on the first application startup with default credentials. The admin account has full access to all administrative features including user management, server moderation, and system configuration.

## Automatic Admin Creation

### How It Works

When you start the application for the first time, the system automatically checks if an admin user exists. If not, it creates one using the credentials specified in your `.env` file or the default values.

### Default Credentials

If no custom credentials are specified, the following default admin account is created:

- **Email**: `admin@example.com`
- **Username**: `admin`
- **Password**: `Admin123456`
- **Role**: `ADMIN`

### Customizing Admin Credentials

To use custom admin credentials, update your `.env` file with the following variables:

```env
# Default Admin User Configuration
ADMIN_EMAIL=your-admin@example.com
ADMIN_USERNAME=youradmin
ADMIN_PASSWORD=YourSecurePassword123
```

**Important Security Notes:**
- Always change the default password after first login
- Use a strong password (minimum 8 characters, mix of letters, numbers, and symbols)
- Never commit the `.env` file to version control
- In production, use environment variables instead of the `.env` file

## Manual Admin Creation

If you prefer to create the admin account manually, you can use the seed script:

### Using npm Script

```bash
npm run seed:admin
```

This will:
1. Check if an admin user already exists
2. If exists, display the admin details
3. If not exists, create a new admin user
4. Display the login credentials

### Using Environment Variables

You can also customize the admin credentials when running the seed script:

```bash
# Windows (cmd.exe)
set ADMIN_EMAIL=custom@example.com && set ADMIN_USERNAME=customadmin && set ADMIN_PASSWORD=CustomPass123 && npm run seed:admin

# Windows (PowerShell)
$env:ADMIN_EMAIL="custom@example.com"; $env:ADMIN_USERNAME="customadmin"; $env:ADMIN_PASSWORD="CustomPass123"; npm run seed:admin

# Linux/Mac
ADMIN_EMAIL=custom@example.com ADMIN_USERNAME=customadmin ADMIN_PASSWORD=CustomPass123 npm run seed:admin
```

## Admin Features

Once logged in as an admin, you have access to:

### User Management
- View all users in the system
- Update user information
- Block/unblock users
- Manage user roles
- View user activity

### Server Management
- View all servers
- Block/unblock servers
- Access server details
- Moderate server content

### System Administration
- Full access to all API endpoints
- Ability to manage roles and permissions
- System-wide configuration access

## Logging In as Admin

### Using Swagger UI

1. Navigate to `http://localhost:5000/api`
2. Click on **Auth** section
3. Expand **POST /api/auth/login**
4. Click **Try it out**
5. Enter admin credentials:
   ```json
   {
     "email": "admin@example.com",
     "password": "Admin123456"
   }
   ```
6. Click **Execute**
7. Copy the returned token
8. Click the **Authorize** button at the top right
9. Enter `Bearer YOUR_TOKEN` and click **Authorize**

### Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123456"
  }'
```

### Using JavaScript/Fetch

```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'Admin123456',
  }),
})
  .then(response => response.json())
  .then(data => {
    console.log('Token:', data.token);
    console.log('User:', data.user);
  });
```

## Changing Admin Password

After first login, it's highly recommended to change the default password. You can do this by:

### Option 1: Using the Users API

```bash
curl -X PATCH http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "password": "NewSecurePassword123"
  }'
```

### Option 2: Direct Database Update

⚠️ **Warning**: This method requires direct database access and should be used with caution.

```bash
# Using Node.js
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('database.sqlite'); const bcrypt = require('bcrypt'); bcrypt.hash('NewPassword123', 10).then(hash => { db.run('UPDATE users SET password = ? WHERE email = ?', [hash, 'admin@example.com'], (err) => { if(err) console.error(err); else console.log('Password updated'); db.close(); }); });"
```

## Multiple Admin Accounts

You can create multiple admin accounts by:

### Using the Seed Script Multiple Times

Run the seed script with different email addresses:

```bash
ADMIN_EMAIL=admin2@example.com ADMIN_USERNAME=admin2 ADMIN_PASSWORD=Admin2123456 npm run seed:admin
```

### Via Registration and Role Update

1. Register a new user via `/api/auth/register`
2. Use the admin API to update the user's role to `ADMIN`

```bash
curl -X PATCH http://localhost:5000/api/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "role": "admin"
  }'
```

## Troubleshooting

### Admin Account Not Created

**Problem**: Admin account wasn't created automatically

**Solutions**:
1. Check the server logs for errors
2. Ensure the database is properly initialized
3. Verify the `.env` file exists and is properly configured
4. Try creating the admin manually using `npm run seed:admin`

### Cannot Login as Admin

**Problem**: Getting "Invalid credentials" error

**Solutions**:
1. Verify you're using the correct email and password
2. Check if the admin account exists in the database
3. Ensure the admin account is active (`isActive: true`)
4. Try resetting the password using the methods above

### Admin Account is Blocked

**Problem**: Admin account shows as inactive/blocked

**Solution**:
```bash
curl -X PATCH http://localhost:5000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "isActive": true
  }'
```

Or update directly in the database:
```bash
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('database.sqlite'); db.run('UPDATE users SET isActive = 1 WHERE email = ?', ['admin@example.com'], (err) => { if(err) console.error(err); else console.log('Account activated'); db.close(); });"
```

## Security Best Practices

1. **Change Default Password**: Always change the default admin password immediately after first login
2. **Use Strong Passwords**: Use passwords with at least 12 characters, including uppercase, lowercase, numbers, and special characters
3. **Enable 2FA**: Consider implementing two-factor authentication (future feature)
4. **Limit Admin Access**: Only grant admin privileges to trusted users
5. **Monitor Activity**: Regularly review admin activity logs
6. **Regular Password Rotation**: Change admin passwords periodically
7. **Secure Environment**: Keep `.env` file secure and never commit to version control
8. **Use HTTPS**: Always use HTTPS in production environments

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `ADMIN_EMAIL` | Admin user email address | `admin@example.com` | No |
| `ADMIN_USERNAME` | Admin username | `admin` | No |
| `ADMIN_PASSWORD` | Admin password | `Admin123456` | No |

## API Endpoints for Admin

### Authentication
- `POST /api/auth/login` - Login as admin
- `GET /api/auth/me` - Get current admin info

### User Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id` - Update user (including role)
- `DELETE /api/users/:id` - Delete user

### Admin Panel
- `GET /api/admin/users` - Get all users with pagination
- `PATCH /api/admin/users/:id` - Update user as admin
- `DELETE /api/admin/users/:id` - Delete user as admin
- `PATCH /api/admin/servers/:id/block` - Block a server
- `PATCH /api/admin/servers/:id/unblock` - Unblock a server

For complete API documentation, visit `http://localhost:5000/api`

## Support

If you encounter any issues with admin account setup:

1. Check the server console logs for detailed error messages
2. Review the [AUTHENTICATION_TROUBLESHOOTING.md](AUTHENTICATION_TROUBLESHOOTING.md) guide
3. Ensure the database is properly initialized
4. Verify all environment variables are set correctly
5. Check the API documentation at `http://localhost:5000/api`
