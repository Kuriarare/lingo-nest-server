import { Injectable } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatsRepository } from './chats.repository';
import { GlobalChat } from './entities/global-chat.entity';

@Injectable()
export class ChatService {
  constructor(private readonly chatsRepositoy: ChatsRepository) {}
  async getChats(room: string): Promise<Chat[]> {
    return this.chatsRepositoy.getChats(room);
  }

  async getGlobalChats(room: string): Promise<GlobalChat[]> {
    return this.chatsRepositoy.getGlobalChats(room);
  }

  async deleteGlobalChat(id: string): Promise<void> {
    return this.chatsRepositoy.deleteGlobalChat(id);
  }

  async deleteNormalChat(id: string): Promise<void> {
    return this.chatsRepositoy.deleteNormalChat(id);
  }
}
