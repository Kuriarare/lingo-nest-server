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

@Injectable({ scope: Scope.DEFAULT })
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class VideoCallsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly chatsRepository: ChatsRepository) {}

  handleConnection(socket: Socket) {
    console.log('A user connected:', socket.id);
  }

  handleDisconnect(socket: Socket) {
    console.log(`User disconnected: ${socket.id}`);
  }

  notifyUserOnline(user: any) {
    const { id, name } = user;
    console.log(`User ${id} is now online`);
    this.server.emit('userStatus', { id: id, online: 'online', name: name });
  }
  notifyUserOffline(user: any) {
    const { id, name } = user;

    console.log(`User ${id} is now offline`);
    this.server.emit('userStatus', { id: id, online: 'offline', name: name });
  }

  @SubscribeMessage('join')
  handleJoinRoom(socket: Socket, data: { username: string; room: string }) {
    console.log(`User ${data.username} joining room ${data.room}`);
    socket.join(data.room);
    socket.broadcast.to(data.room).emit('ready', { username: data.username });
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

      // Notify all users in the room that the message has been deleted
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
      // Create a new global chat message
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

      this.server.to(data.room).emit('globalChat', globalChatData);
    } catch (err) {
      console.error('Error saving global chat message:', err);
    }
  }
}
