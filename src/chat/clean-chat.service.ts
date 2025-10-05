import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Repository, LessThan } from 'typeorm'; // Import LessThan
import { InjectRepository } from '@nestjs/typeorm';
import { ArchivedChat } from './entities/archived-chat.entity';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatCleanupService {
  constructor(
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,

    @InjectRepository(ArchivedChat)
    private archivedChatRepository: Repository<ArchivedChat>,
  ) {}

  @Cron('0 0 * * *')
  async archiveOldMessages() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Fetch messages older than 1 month
    const oldMessages = await this.chatRepository.find({
      where: { timestamp: LessThan(oneMonthAgo) },
    });

    // Insert old messages into the archive table
    const archivedMessages = oldMessages.map((message) => ({
      ...message,
      archivedAt: new Date(),
    }));
    await this.archivedChatRepository.save(archivedMessages);

    // Delete archived messages from the main chat table
    await this.chatRepository.delete({
      timestamp: LessThan(oneMonthAgo),
    });
  }

  @Cron('0 1 * * *') // Runs daily at 1:00 AM
  async deleteOldArchivedChats() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Delete archived chats older than one year
    await this.archivedChatRepository.delete({
      archivedAt: LessThan(oneYearAgo),
    });
  }
}
