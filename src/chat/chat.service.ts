import { Injectable } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatsRepository } from './chats.repository';

@Injectable()
export class ChatService {
  constructor(private readonly chatsRepositoy: ChatsRepository) {}
  async getChats(room: string): Promise<Chat[]> {
    return this.chatsRepositoy.getChats(room);
  }
}
