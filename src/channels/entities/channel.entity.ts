import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Server } from '../../servers/entities/server.entity';
import { Message } from '../../messages/entities/message.entity';

export enum ChannelType {
  TEXT = 'text',
  VOICE = 'voice',
}

@Entity('channels')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'simple-enum',
    enum: ChannelType,
    default: ChannelType.TEXT,
  })
  type: ChannelType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Server, (server) => server.channels, { onDelete: 'CASCADE' })
  server: Server;

  @Column()
  serverId: number;

  @OneToMany(() => Message, (message) => message.channel)
  messages: Message[];
}
