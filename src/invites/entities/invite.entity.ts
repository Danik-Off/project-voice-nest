import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Server } from '../../servers/entities/server.entity';
import { User } from '../../users/entities/user.entity';

@Entity('invites')
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  token: string;

  @Column({ nullable: true })
  maxUses: number;

  @Column({ default: 0 })
  uses: number;

  @Column({ nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Server, (server) => server.invites, { onDelete: 'CASCADE' })
  server: Server;

  @Column()
  serverId: number;

  @ManyToOne(() => User, (user) => user.createdInvites, { onDelete: 'CASCADE' })
  createdByUser: User;

  @Column()
  createdBy: number;
}
