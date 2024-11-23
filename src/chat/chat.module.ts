import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatsRepository } from './chats.repository';
import { Chat } from './entities/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalChat } from './entities/global-chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, GlobalChat])],
  controllers: [ChatController],
  providers: [ChatService, ChatsRepository],
  exports: [ChatsRepository],
})
export class ChatModule {}
