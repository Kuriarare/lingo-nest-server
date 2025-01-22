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
import { UnreadGlobalMessage } from './chat/entities/unread-global-messages.entity';
import { UsersRepository } from './users/users.repository';

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

  constructor(
    private readonly chatsRepository: ChatsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

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

      // Fetch all users and filter them based on the room and conditions
      const allUsers = await this.chatsRepository.findAllUsers();
      const senderEmail = data.email;

      const updates = [];

      for (const user of allUsers) {
        if (user.user.email === senderEmail) {
          continue;
        }

        const updateData: Partial<UnreadGlobalMessage> = {};

        switch (data.room) {
          case 'uuid-english':
            if (
              user.user.language === 'english' ||
              user.user.role === 'admin'
            ) {
              updateData.generalEnglishRoom =
                (user.generalEnglishRoom || 0) + 1;
            }
            break;
          case 'uuid-spanish':
            if (
              user.user.language === 'spanish' ||
              user.user.role === 'admin'
            ) {
              updateData.generalSpanishRoom =
                (user.generalSpanishRoom || 0) + 1;
            }
            break;
          case 'uuid-polish':
            if (user.user.language === 'polish' || user.user.role === 'admin') {
              updateData.generalPolishRoom = (user.generalPolishRoom || 0) + 1;
            }
            break;
          case 'uuid-teacher-english':
            if (
              (user.user.language === 'english' &&
                user.user.role === 'teacher') ||
              user.user.role === 'admin'
            ) {
              updateData.teachersEnglishRoom =
                (user.teachersEnglishRoom || 0) + 1;
            }
            break;
          case 'uuid-teacher-spanish':
            if (
              (user.user.language === 'spanish' &&
                user.user.role === 'teacher') ||
              user.user.role === 'admin'
            ) {
              updateData.teachersSpanishRoom =
                (user.teachersSpanishRoom || 0) + 1;
            }
            break;
          case 'uuid-teacher-polish':
            if (
              (user.user.language === 'polish' &&
                user.user.role === 'teacher') ||
              user.user.role === 'admin'
            ) {
              updateData.teachersPolishRoom =
                (user.teachersPolishRoom || 0) + 1;
            }
            break;
          default:
            // Check if the room matches the teacher's ID (for students) or the user's own ID (for teachers)
            if (data.room) {
              // Increment for students whose teacher matches the room ID
              if (
                user.user.role === 'user' &&
                user.user.teacher &&
                data.room === user.user.teacher.id
              ) {
                console.log(
                  'we enter inside the rich student',
                  user.user.teacher.id,
                );
                updateData.randomRoom = (user.randomRoom || 0) + 1;
              }

              // Increment for teachers whose ID matches the room
              if (user.user.role === 'teacher' && data.room === user.user.id) {
                console.log('we enter inside the rich teacher', user.user.id);
                updateData.randomRoom = (user.randomRoom || 0) + 1;
              }
            }
            break;
        }

        if (Object.keys(updateData).length > 0) {
          updates.push({
            ...user,
            ...updateData,
          });
        }
      }

      // Save the updated unread messages in bulk
      if (updates.length > 0) {
        for (const update of updates) {
          await this.chatsRepository.saveUnreadMessage(update);
        }
      }

      // Emit the message to the users in the room
      this.server.to(data.room).emit('globalChat', globalChatData);

      // Emit a global notification to all users (including those outside the room)
      socket.broadcast.emit('newUnreadGlobalMessage', { room: data.room });
    } catch (err) {
      console.error('Error saving global chat message:', err);
    }
  }
}
