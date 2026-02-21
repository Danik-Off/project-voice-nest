import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GatewayService } from './gateway.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger, UseGuards } from '@nestjs/common';

interface SignalPayload {
  to: string;
  type: 'offer' | 'answer' | 'candidate';
  sdp?: string;
  candidate?: {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
  };
}

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  path: '/socket.io/',
  namespace: '/socket',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VoiceGateway.name);

  constructor(
    private gatewayService: GatewayService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided for client ${client.id}`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'default_secret_key',
      });

      // Store userId in socket for later use
      client.userId = decoded.sub;

      this.logger.log(`Client connected: ${client.id}, userId: ${decoded.sub}`);
    } catch (error) {
      this.logger.error(`Connection rejected: Invalid token for client ${client.id}`, error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}, userId: ${client.userId}`);

    // Remove user from all rooms
    for (const [roomId, room] of this.gatewayService['rooms'] as any) {
      if (room.participants.has(client.id)) {
        room.participants.delete(client.id);
        // Notify other participants about disconnection
        client.to(roomId).emit('user-disconnected', client.id);
        if (room.participants.size === 0) {
          this.gatewayService['rooms'].delete(roomId);
        }
      }
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    roomId: string,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Join room
      const room = await this.gatewayService.joinRoom(roomId, client.userId, client.id);

      // Send created event to the user who joined
      client.emit('created', {
        roomId,
        participants: Array.from(room.participants.values()),
      });

      // Notify other participants
      client.to(roomId).emit('user-connected', {
        socketId: client.id,
        userData: room.participants.get(client.id)!.userData,
      });

      this.logger.log(`User ${client.userId} joined room ${roomId}`);
    } catch (error) {
      this.logger.error(`Failed to join room ${roomId}:`, error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string },
  ) {
    this.gatewayService.leaveRoom(payload.roomId, client.id);

    // Notify other participants
    client.to(payload.roomId).emit('user-disconnected', client.id);

    this.logger.log(`User ${client.userId} left room ${payload.roomId}`);
  }

  @SubscribeMessage('signal')
  async handleSignal(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: SignalPayload,
  ) {
    const { to, type, sdp, candidate } = payload;

    // Forward signal to target user
    client.to(to).emit('signal', {
      from: client.id,
      type,
      sdp,
      candidate,
    });
  }

  @SubscribeMessage('toggle-mic')
  async handleToggleMic(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { roomId: string },
  ) {
    this.gatewayService.toggleMic(payload.roomId, client.id);

    // Notify room participants about mic toggle
    const room = this.gatewayService.getRoom(payload.roomId);
    if (room) {
      client.to(payload.roomId).emit('user-mic-toggle', {
        socketId: client.id,
        micToggle: room.participants.get(client.id)!.micToggle,
      });
    }
  }
}
