import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { GlobalChat } from './entities/global-chat.entity';

@Injectable()
export class ChatsRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(GlobalChat)
    private readonly globalChatRepository: Repository<GlobalChat>,
  ) {}

  // Get regular chats for a specific room
  async getChats(room: string): Promise<Chat[]> {
    try {
      const chats = await this.chatRepository
        .createQueryBuilder('chat')
        .where('chat.room = :room', { room })
        .orderBy('chat.timestamp', 'DESC')
        .take(50)
        .getMany();

      return chats;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw new InternalServerErrorException('Failed to fetch chats');
    }
  }

  // Get global chats for a specific room
  async getGlobalChats(room: string): Promise<GlobalChat[]> {
    try {
      const chats = await this.globalChatRepository
        .createQueryBuilder('globalChat')
        .where('globalChat.room = :room', { room })
        .orderBy('globalChat.timestamp', 'DESC')
        .take(50)
        .getMany();

      return chats;
    } catch (error) {
      console.error('Error fetching global chats:', error);
      throw new InternalServerErrorException('Failed to fetch global chats');
    }
  }

  // Save a regular chat message
  async saveChat(chat: Chat): Promise<Chat> {
    try {
      return await this.chatRepository.save(chat);
    } catch (error) {
      console.error('Error saving chat:', error);
      throw new InternalServerErrorException('Failed to save chat');
    }
  }

  // Save a global chat message
  async saveGlobalChat(globalChat: GlobalChat): Promise<GlobalChat> {
    try {
      return await this.globalChatRepository.save(globalChat);
    } catch (error) {
      console.error('Error saving global chat:', error);
      throw new InternalServerErrorException('Failed to save global chat');
    }
  }
}
