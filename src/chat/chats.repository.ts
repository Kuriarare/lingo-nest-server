import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatsRepository {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

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

  async saveChat(chat: Chat): Promise<Chat> {
    try {
      return await this.chatRepository.save(chat);
    } catch (error) {
      console.error('Error saving chat:', error);
      throw new InternalServerErrorException('Failed to save chat');
    }
  }
}
