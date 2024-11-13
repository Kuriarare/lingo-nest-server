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
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 3);

    // Fetch messages older than 3 months
    const oldMessages = await this.chatRepository.find({
      where: { timestamp: LessThan(fiveMonthsAgo) },
    });

    // Insert old messages into the archive table
    const archivedMessages = oldMessages.map((message) => ({
      ...message,
      archivedAt: new Date(),
    }));
    await this.archivedChatRepository.save(archivedMessages);

    // Delete archived messages from the main chat table
    await this.chatRepository.delete({
      timestamp: LessThan(fiveMonthsAgo),
    });

    console.log('Archived old messages successfully');
  }
}
