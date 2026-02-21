import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Server } from '../../servers/entities/server.entity';
import { Message } from '../../messages/entities/message.entity';
import { ServerMember } from '../../server-members/entities/server-member.entity';
import { Invite } from '../../invites/entities/invite.entity';
import { Friend } from '../../friends/entities/friend.entity';
import { BlockedUser } from '../../friends/entities/blocked-user.entity';
import { Role } from '../../roles/entities/role.entity';

export enum UserRoleEnum {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export enum UserStatus {
  ONLINE = 'online',
  IDLE = 'idle',
  DND = 'dnd',
  OFFLINE = 'offline',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'simple-enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.USER,
  })
  role: UserRoleEnum;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  profilePicture: string;

  @Column({
    type: 'simple-enum',
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;

  @Column({ nullable: true })
  tag: string;

  @Column({ nullable: true })
  bio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Server, (server) => server.owner)
  ownedServers: Server[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => ServerMember, (member) => member.user)
  serverMemberships: ServerMember[];

  @OneToMany(() => Invite, (invite) => invite.createdByUser)
  createdInvites: Invite[];

  @OneToMany(() => Friend, (friend) => friend.user)
  friends: Friend[];

  @OneToMany(() => Friend, (friend) => friend.friend)
  friendOf: Friend[];

  @OneToMany(() => BlockedUser, (blocked) => blocked.blocker)
  blockedUsers: BlockedUser[];

  @OneToMany(() => BlockedUser, (blocked) => blocked.blocked)
  blockedBy: BlockedUser[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];
}
