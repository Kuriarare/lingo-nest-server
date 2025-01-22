import { Injectable } from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatsRepository } from './chats.repository';
import { GlobalChat } from './entities/global-chat.entity';
import { UnreadGlobalMessage } from './entities/unread-global-messages.entity';
import { DeleteUnreadDto } from './dtos/delete-unread-dto';

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

  async getUnreadGlobalMessages(id: string): Promise<UnreadGlobalMessage[]> {
    return this.chatsRepositoy.getUnreadGlobalMessages(id);
  }

  async deleteUnreadGlobalMessages(
    userId: string,
    room: string,
  ): Promise<string> {
    return this.chatsRepositoy.deleteUnreadGlobalMessages(userId, room);
  }
}
