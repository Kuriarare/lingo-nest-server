import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:room')
  async getChats(@Param('room') room: string) {
    return this.chatService.getChats(room);
  }

  @Get('global-chats/:room')
  async getGlobalChats(@Param('room') room: string) {
    return this.chatService.getGlobalChats(room);
  }

  @Delete('delete-global-chat/:id')
  async deleteGlobalChat(@Param('id') id: string) {
    return this.chatService.deleteGlobalChat(id);
  }

  @Delete('delete-normal-chat/:id')
  async deleteNormalChat(@Param('id') id: string) {
    return this.chatService.deleteNormalChat(id);
  }
}
