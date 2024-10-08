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

  @SubscribeMessage('screenSharing')
  handleScreenSharing(
    socket: Socket,
    data: { room: string; isScreenSharing: boolean; senderId: string },
  ) {
    console.log(`Room: ${data.room}, Sender ID: ${data.senderId}`);
    socket.broadcast.to(data.room).emit('screenSharing', {
      isScreenSharing: data.isScreenSharing,
      senderId: data.senderId,
    });
  }

  @SubscribeMessage('chat')
  async handleChat(
    socket: Socket,
    data: { username: string; room: string; message: string },
  ) {
    try {
      const chatData = new Chat();
      chatData.username = data.username;
      chatData.room = data.room;
      chatData.message = data.message;
      chatData.timestamp = new Date();

      await this.chatsRepository.saveChat(chatData);
      this.server.to(data.room).emit('chat', chatData);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  }
}
