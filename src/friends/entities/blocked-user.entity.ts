import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('blocked_users')
@Unique(['blockerId', 'blockedId'])
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.blockedUsers, { onDelete: 'CASCADE' })
  blocker: User;

  @Column()
  blockerId: number;

  @ManyToOne(() => User, (user) => user.blockedBy, { onDelete: 'CASCADE' })
  blocked: User;

  @Column()
  blockedId: number;
}
