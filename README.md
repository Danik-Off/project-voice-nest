# ProjectVoice

A voice communication application built with NestJS, featuring real-time messaging, server management, and WebRTC support.

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Server Management**: Create and manage voice/text servers
- **Channels**: Organize communication with text and voice channels
- **Real-time Messaging**: WebSocket-based instant messaging
- **Friend System**: Add friends and manage relationships
- **Role Management**: Custom roles with permissions
- **Admin Panel**: User and server administration
- **API Documentation**: Interactive Swagger UI

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
copy .env.example .env
```

The `.env` file is already configured for development with:
- JWT Secret for token generation
- SQLite database path
- Server port (5000)

### 3. Start the Server

```bash
# Development mode with hot reload
npm run start:dev

# Or just start
npm run start
```

The server will start at `http://localhost:5000`

### 4. Create Admin Account

**Automatic Creation (Recommended)**

The admin account is created automatically on the first application startup with these default credentials:
- Email: `admin@example.com`
- Password: `Admin123456`
- Username: `admin`

You can customize these credentials in the `.env` file:
```env
ADMIN_EMAIL=your-admin@example.com
ADMIN_USERNAME=youradmin
ADMIN_PASSWORD=YourSecurePassword123
```

**Manual Creation**

If you prefer to create the admin manually, run:

```bash
npm run seed:admin
```

Or create a test user:

```bash
npm run seed:user
```

This creates a test user with:
- Email: `test@example.com`
- Password: `Test123456`

**Manual Registration via API**

Send a POST request to `http://localhost:5000/api/auth/register`:

```json
{
  "username": "yourusername",
  "email": "youremail@example.com",
  "password": "YourSecurePassword123"
}
```

### 5. Login

Send a POST request to `http://localhost:5000/api/auth/login`:

**Using Admin Account:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123456"
}
```

**Using Test User:**
```json
{
  "email": "test@example.com",
  "password": "Test123456"
}
```

You'll receive a JWT token in the response. Use this token for authenticated requests.

## API Documentation

Once the server is running, visit the interactive API documentation:

```
http://localhost:5000/api
```

This Swagger UI provides:
- Complete API endpoint documentation
- Request/response examples
- Try-it-out functionality
- Authentication support (click "Authorize" button)

## Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the project
npm run start:prod         # Start production build

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Utilities
npm run seed:user          # Create a test user
npm run seed:admin         # Create an admin user
npm run lint               # Lint code
npm run format             # Format code with Prettier
```

## Authentication

### How Authentication Works

1. **Register**: Create an account via `/api/auth/register`
2. **Login**: Get a JWT token via `/api/auth/login`
3. **Use Token**: Include the token in the Authorization header:
   ```
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

### Common Issues

**Problem**: "Invalid credentials" error (401)

**Solution**: The database is empty. You need to register a user first:
- Use `npm run seed:user` to create a test user
- Or register via the API endpoint

For detailed troubleshooting, see [AUTHENTICATION_TROUBLESHOOTING.md](AUTHENTICATION_TROUBLESHOOTING.md)

## Project Structure

```
src/
├── auth/              # Authentication & authorization
├── users/             # User management
├── servers/           # Server management
├── channels/          # Channel management
├── messages/          # Messaging system
├── server-members/    # Server membership
├── invites/           # Invite system
├── friends/           # Friend system
├── roles/             # Role management
├── admin/             # Admin panel
├── gateway/           # WebSocket gateway
└── database/          # Database configuration
```

## Database

The project uses SQLite for development. The database file is `database.sqlite` in the root directory.

**Reset Database**: To start fresh, delete `database.sqlite` and restart the server.

## WebSocket

Real-time communication is handled via WebSocket. See [WEBSOCKET_GUIDE.md](WEBSOCKET_GUIDE.md) for detailed information.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (authenticated)

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user

### Servers
- `POST /api/servers` - Create server
- `GET /api/servers` - Get all servers
- `GET /api/servers/:id` - Get server by ID
- `PATCH /api/servers/:id` - Update server
- `DELETE /api/servers/:id` - Delete server

### Channels
- `POST /api/channels` - Create channel
- `GET /api/channels` - Get all channels
- `GET /api/channels/:id` - Get channel by ID
- `PATCH /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

### Messages
- `POST /api/messages` - Create message
- `GET /api/messages` - Get all messages
- `GET /api/messages/:id` - Get message by ID
- `PATCH /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

And more... See the full API documentation at `http://localhost:5000/api`

## Development Tips

1. **Hot Reload**: Use `npm run start:dev` for automatic restart on changes
2. **Database**: SQLite is used for easy development. Consider PostgreSQL for production
3. **Environment**: Never commit `.env` file. Use `.env.example` as template
4. **JWT Secret**: Change the default JWT_SECRET in production
5. **Testing**: Write tests for new features

## Troubleshooting

### Port Already in Use
If port 5000 is already in use, change the `PORT` in `.env` file.

### Database Errors
If you encounter database errors:
1. Delete `database.sqlite`
2. Restart the server
3. Run `npm run seed:user` to create a test user

### Authentication Issues
See [AUTHENTICATION_TROUBLESHOOTING.md](AUTHENTICATION_TROUBLESHOOTING.md) for detailed guidance.

### WebSocket Issues
See [WEBSOCKET_TROUBLESHOOTING.md](WEBSOCKET_TROUBLESHOOTING.md) for WebSocket-specific problems.

## Technologies

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: SQLite (TypeORM)
- **Authentication**: JWT (Passport)
- **Real-time**: Socket.io
- **API Docs**: Swagger
- **Validation**: class-validator
- **Password Hashing**: bcrypt

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT license.

## Support

For issues and questions:
- Check the API documentation at `http://localhost:5000/api`
- Review the troubleshooting guides
- Check the server console for error logs

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Socket.io Documentation](https://socket.io/docs)
