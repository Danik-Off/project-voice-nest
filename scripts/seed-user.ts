/**
 * Seed Script - Create a test user in the database
 * 
 * Usage: npm run seed:user
 * 
 * This script creates a default test user with the following credentials:
 * - Email: test@example.com
 * - Password: Test123456
 * - Username: testuser
 */

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User, UserRoleEnum, UserStatus } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const DEFAULT_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123456',
};

async function seedUser() {
  console.log('🌱 Starting user seed...\n');

  try {
    // Create database connection
    const connection = await createConnection({
      type: 'sqlite',
      database: './database.sqlite',
      entities: [User],
      synchronize: false, // Don't modify schema
    });

    console.log('✅ Connected to database');

    const userRepository = connection.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: DEFAULT_USER.email },
    });

    if (existingUser) {
      console.log('⚠️  User already exists:');
      console.log(`   - ID: ${existingUser.id}`);
      console.log(`   - Username: ${existingUser.username}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Role: ${existingUser.role}`);
      console.log(`   - Active: ${existingUser.isActive}`);
      console.log('\n💡 You can login with these credentials:');
      console.log(`   Email: ${DEFAULT_USER.email}`);
      console.log(`   Password: ${DEFAULT_USER.password}`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);

      // Generate random tag
      const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;

      // Create user
      const user = userRepository.create({
        username: DEFAULT_USER.username,
        email: DEFAULT_USER.email,
        password: hashedPassword,
        role: UserRoleEnum.USER,
        status: UserStatus.OFFLINE,
        tag,
        isActive: true,
      });

      await userRepository.save(user);

      console.log('✅ Test user created successfully!');
      console.log('\n📋 User Details:');
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Username: ${user.username}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Tag: ${user.tag}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Status: ${user.status}`);
      console.log(`   - Active: ${user.isActive}`);
      console.log('\n🔑 Login Credentials:');
      console.log(`   Email: ${DEFAULT_USER.email}`);
      console.log(`   Password: ${DEFAULT_USER.password}`);
      console.log('\n📝 You can now login using POST /api/auth/login');
    }

    console.log('\n✨ Seed completed!\n');

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seed:', error.message);
    console.error('\n💡 Make sure the database exists and the server has been run at least once.');
    console.error('💡 Run: npm run start:dev');
    process.exit(1);
  }
}

seedUser();
