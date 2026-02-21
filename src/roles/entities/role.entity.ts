import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Server } from '../../servers/entities/server.entity';
import { User } from '../../users/entities/user.entity';
import { ServerMember } from '../../server-members/entities/server-member.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  color: string;

  @Column({ type: 'bigint', default: 0 })
  permissions: bigint;

  @Column({ default: 0 })
  position: number;

  @Column({ default: false })
  isHoisted: boolean;

  @Column({ default: false })
  isMentionable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Server, (server) => server.roles, { onDelete: 'CASCADE' })
  server: Server;

  @Column()
  serverId: number;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => ServerMember, (member) => member.roles)
  members: ServerMember[];
}
