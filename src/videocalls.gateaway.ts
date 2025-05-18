import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsRepository } from './chat/chats.repository';
import { Chat } from './chat/entities/chat.entity';
import { Injectable, Scope } from '@nestjs/common';
import { GlobalChat } from './chat/entities/global-chat.entity';
import {
  CounterStrategy,
  generalLanguageStrategy,
  randomRoomStrategy,
  teacherLanguageStrategy,
} from './chat/strategies/counter-strategies';
import { UnreadCounterService } from './chat/unread-counter.service';
import { CounterField } from './chat/types';

@Injectable({ scope: Scope.DEFAULT })
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VideoCallsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly counterStrategies: CounterStrategy[] = [
    generalLanguageStrategy,
    teacherLanguageStrategy,
    randomRoomStrategy,
  ];
  private readonly validLanguages = new Set(['english', 'spanish', 'polish']);
  private readonly uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  @WebSocketServer() server: Server;

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly unreadCounterService: UnreadCounterService,
  ) {}

  handleConnection(socket: Socket) {
    // console.log('A user connected:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    // console.log(`User disconnected: ${socket.id}`);
  }

  notifyUserOnline(user: any) {
    const { id, name } = user;
    this.server.emit('userStatus', { id: id, online: 'online', name: name });
  }

  notifyUserOffline(user: any) {
    const { id, name } = user;
    this.server.emit('userStatus', { id: id, online: 'offline', name: name });
  }

  @SubscribeMessage('join')
  handleJoinRoom(socket: Socket, data: { username: string; room: string }) {
    try {
      console.log(`User ${data.username} attempting to join room ${data.room}`);

      // Dejar todas las habitaciones excepto la predeterminada (propia del socket)
      const rooms = Array.from(socket.rooms); // Obtén todas las salas a las que pertenece el socket
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room); // Abandona cualquier sala que no sea la propia
          console.log(`User ${data.username} left room ${room}`);
        }
      });

      // Unirse a la nueva sala
      socket.join(data.room);
      console.log(
        `User ${data.username} successfully joined room ${data.room}`,
      );

      // Notificar a los usuarios de la nueva sala
      socket.broadcast.to(data.room).emit('ready', { username: data.username });
    } catch (err) {
      console.error('Error joining room:', err);
    }
  }

  @SubscribeMessage('data')
  handleWebRTCSignaling(socket: Socket, data: any) {
    const { type, room } = data;
    if (['offer', 'answer', 'candidate'].includes(type)) {
      socket.broadcast.to(room).emit('data', data);
    } else {
      console.warn('Received unknown data type:', type);
    }
  }

  @SubscribeMessage('deleteGlobalChat')
  async handleDeleteGlobalChat(
    socket: Socket,
    data: { messageId: string; room: string },
  ) {
    try {
      // Call repository to delete message
      await this.chatsRepository.deleteGlobalChat(data.messageId);

      console.log(`Message ${data.messageId} deleted successfully`);

      // Notify all users in the room that the message has been deleted
      this.server
        .to(data.room)
        .emit('globalChatDeleted', { messageId: data.messageId });
    } catch (err) {
      console.error('Error deleting global chat message:', err);
    }
  }

  @SubscribeMessage('deleteNormalChat')
  async handleDeleteNormalChat(
    socket: Socket,
    data: { messageId: string; room: string },
  ) {
    try {
      // Call repository to delete message
      await this.chatsRepository.deleteNormalChat(data.messageId);

      console.log(`Message ${data.messageId} deleted successfully`);

      this.server
        .to(data.room)
        .emit('normalChatDeleted', { messageId: data.messageId });
    } catch (err) {
      console.error('Error deleting global chat message:', err);
    }
  }

  @SubscribeMessage('chat')
  async handleChat(
    socket: Socket,
    data: {
      username: string;
      email: string;
      room: string;
      message: string;
      userUrl?: string;
    },
  ) {
    try {
      const chatData = new Chat();
      chatData.username = data.username;
      chatData.email = data.email;
      chatData.room = data.room;
      chatData.message = data.message;
      chatData.timestamp = new Date();
      if (data.userUrl) {
        chatData.userUrl = data.userUrl;
      }
      await this.chatsRepository.saveChat(chatData);
      this.server.to(data.room).emit('chat', chatData);
      socket.broadcast.emit('newChat', { room: data.room });
    } catch (err) {
      console.error('Error saving message:', err);
    }
  }

  @SubscribeMessage('globalChat')
  async handleGlobalChat(
    socket: Socket,
    data: {
      username: string;
      email: string;
      room: string;
      message: string;
      userUrl?: string;
    },
  ) {
    try {
      // Create and save the global chat message
      const globalChatData = new GlobalChat();
      globalChatData.username = data.username;
      globalChatData.email = data.email;
      globalChatData.room = data.room;
      globalChatData.message = data.message;
      globalChatData.timestamp = new Date();
      if (data.userUrl) {
        globalChatData.userUrl = data.userUrl;
      }
      await this.chatsRepository.saveGlobalChat(globalChatData);

      // 2. Actualizar contadores usando estrategias
      const strategy = this.counterStrategies.find((s) =>
        s.roomPattern.test(data.room),
      );

      if (strategy) {
        const counterField = this.getCounterField(data.room);
        await this.unreadCounterService.bulkIncrementCounter(
          counterField,
          (qb) => strategy.applyConditions(qb, data.room),
          data.email,
        );
      }
      // Emitir eventos
      this.server.to(data.room).emit('globalChat', globalChatData);
      socket.broadcast.emit('newUnreadGlobalMessage', { room: data.room });
    } catch (err) {
      console.error('Error saving global chat message:', err);
    }
  }

  private getCounterField(room: string): CounterField {
    if (room.startsWith('uuid-teacher-')) {
      const lang = room.split('-')[2];
      return `teachers${this.capitalize(lang)}Room` as CounterField;
    }
    if (room.startsWith('uuid-')) {
      const lang = room.split('-')[1];
      return `general${this.capitalize(lang)}Room` as CounterField;
    }
    return 'randomRoom';
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private parseId(input: string): {
    id?: string;
    role?: string;
    language?: string;
  } {
    if (this.isValidUUID(input)) {
      return { id: input };
    }
    if (input.startsWith('uuid-')) {
      const suffix = input.slice(5);
      const parts = suffix.split('-');
      if (parts.length === 1) {
        return { language: parts[0] };
      }
      if (parts.length === 2) {
        return { role: parts[0], language: parts[1] };
      }
    }
  }

  private isValidUUID(uuid: string): boolean {
    return this.uuidRegex.test(uuid);
  }
}
