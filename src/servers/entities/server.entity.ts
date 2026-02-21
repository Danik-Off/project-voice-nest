import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Channel } from '../../channels/entities/channel.entity';
import { ServerMember } from '../../server-members/entities/server-member.entity';
import { Invite } from '../../invites/entities/invite.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: true })
  isBlocked: boolean;

  @Column({ nullable: true })
  blockReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.ownedServers, { onDelete: 'CASCADE' })
  owner: User;

  @Column()
  ownerId: number;

  @OneToMany(() => Channel, (channel) => channel.server, { cascade: true })
  channels: Channel[];

  @OneToMany(() => ServerMember, (member) => member.server, { cascade: true })
  members: ServerMember[];

  @OneToMany(() => Invite, (invite) => invite.server, { cascade: true })
  invites: Invite[];

  @OneToMany(() => Role, (role) => role.server, { cascade: true })
  roles: Role[];
}
