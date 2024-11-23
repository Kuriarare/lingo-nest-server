import { Controller, Get, Param } from '@nestjs/common';
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
}
