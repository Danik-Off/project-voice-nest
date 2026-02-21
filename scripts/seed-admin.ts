/**
 * Seed Script - Create an admin user in the database
 * 
 * Usage: npm run seed:admin
 * 
 * This script creates an admin user with the following default credentials:
 * - Email: admin@example.com
 * - Password: Admin123456
 * - Username: admin
 * - Role: ADMIN
 * 
 * You can customize these credentials by setting environment variables:
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 * - ADMIN_USERNAME
 */

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { User, UserRoleEnum, UserStatus } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

const DEFAULT_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123456',
};

async function seedAdmin() {
  console.log('🔐 Starting admin user seed...\n');

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

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: DEFAULT_ADMIN.email },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   - ID: ${existingAdmin.id}`);
      console.log(`   - Username: ${existingAdmin.username}`);
      console.log(`   - Email: ${existingAdmin.email}`);
      console.log(`   - Role: ${existingAdmin.role}`);
      console.log(`   - Active: ${existingAdmin.isActive}`);
      
      if (existingAdmin.role === UserRoleEnum.ADMIN) {
        console.log('\n✅ User is already an admin');
      } else {
        console.log('\n⚠️  User exists but is not an admin. Updating role...');
        existingAdmin.role = UserRoleEnum.ADMIN;
        await userRepository.save(existingAdmin);
        console.log('✅ User role updated to ADMIN');
      }
      
      console.log('\n💡 You can login with these credentials:');
      console.log(`   Email: ${DEFAULT_ADMIN.email}`);
      console.log(`   Password: ${DEFAULT_ADMIN.password}`);
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

      // Generate random tag
      const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;

      // Create admin user
      const admin = userRepository.create({
        username: DEFAULT_ADMIN.username,
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        role: UserRoleEnum.ADMIN,
        status: UserStatus.OFFLINE,
        tag,
        isActive: true,
      });

      await userRepository.save(admin);

      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Admin Details:');
      console.log(`   - ID: ${admin.id}`);
      console.log(`   - Username: ${admin.username}`);
      console.log(`   - Email: ${admin.email}`);
      console.log(`   - Tag: ${admin.tag}`);
      console.log(`   - Role: ${admin.role}`);
      console.log(`   - Status: ${admin.status}`);
      console.log(`   - Active: ${admin.isActive}`);
      console.log('\n🔑 Login Credentials:');
      console.log(`   Email: ${DEFAULT_ADMIN.email}`);
      console.log(`   Password: ${DEFAULT_ADMIN.password}`);
      console.log('\n📝 You can now login using POST /api/auth/login');
      console.log('⚠️  Please change the default password after first login!');
    }

    console.log('\n✨ Admin seed completed!\n');

    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during admin seed:', error.message);
    console.error('\n💡 Make sure the database exists and the server has been run at least once.');
    console.error('💡 Run: npm run start:dev');
    process.exit(1);
  }
}

seedAdmin();
