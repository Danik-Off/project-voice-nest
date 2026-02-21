import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { ServerMember, MemberRole } from '../server-members/entities/server-member.entity';

interface RoomParticipant {
  socketId: string;
  userData: {
    id: number;
    username: string;
    profilePicture: string;
    role: string;
  };
  micToggle: boolean;
}

interface Room {
  roomId: string;
  participants: Map<string, RoomParticipant>;
}

@Injectable()
export class GatewayService {
  private rooms: Map<string, Room> = new Map();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ServerMember)
    private serverMemberRepository: Repository<ServerMember>,
  ) {}

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  async joinRoom(roomId: string, userId: number, socketId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is a member of the server
    const serverId = Number(roomId.replace('channel-', ''));
    const membership = await this.serverMemberRepository.findOne({
      where: { serverId, userId },
    });

    if (!membership) {
      throw new Error('User is not a member of this server');
    }

    const userData = {
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture || '',
      role: membership.role,
    };

    const participant: RoomParticipant = {
      socketId,
      userData,
      micToggle: false,
    };

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, { roomId, participants: new Map() });
    }

    const room = this.rooms.get(roomId)!;
    room.participants.set(socketId, participant);

    return room;
  }

  leaveRoom(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.participants.delete(socketId);
      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  toggleMic(roomId: string, socketId: string) {
    const room = this.rooms.get(roomId);
    if (room) {
      const participant = room.participants.get(socketId);
      if (participant) {
        participant.micToggle = !participant.micToggle;
      }
    }
  }

  getParticipants(roomId: string): RoomParticipant[] {
    const room = this.rooms.get(roomId);
    if (!room) {
      return [];
    }
    return Array.from(room.participants.values());
  }
}
