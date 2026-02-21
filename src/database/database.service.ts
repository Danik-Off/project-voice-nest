import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRoleEnum, UserStatus } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultAdmin();
  }

  private async seedDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123456';

    // Check if admin already exists
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      this.logger.log(`Admin user already exists: ${adminEmail}`);
      return;
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Generate random tag
      const tag = `#${Math.floor(1000 + Math.random() * 9000)}`;

      // Create admin user
      const admin = this.userRepository.create({
        username: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: UserRoleEnum.ADMIN,
        status: UserStatus.OFFLINE,
        tag,
        isActive: true,
      });

      await this.userRepository.save(admin);

      this.logger.log('✅ Default admin user created successfully!');
      this.logger.log(`📧 Email: ${adminEmail}`);
      this.logger.log(`👤 Username: ${adminUsername}`);
      this.logger.log(`🔑 Password: ${adminPassword}`);
      this.logger.log('⚠️  Please change the default password after first login!');
    } catch (error) {
      this.logger.error('Failed to create default admin user:', error.message);
    }
  }
}
