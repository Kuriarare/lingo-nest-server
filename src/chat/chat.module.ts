import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatsRepository } from './chats.repository';
import { Chat } from './entities/chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalChat } from './entities/global-chat.entity';
import { UnreadGlobalMessage } from './entities/unread-global-messages.entity';

import { UnreadCounterService } from './unread-counter.service';
import {
  generalLanguageStrategy,
  randomRoomStrategy,
  teacherLanguageStrategy,
} from './strategies/counter-strategies';

import { ArchivedChat } from './entities/archived-chat.entity';
import { ChatCleanupService } from './clean-chat.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chat,
      GlobalChat,
      UnreadGlobalMessage,
      ArchivedChat,
    ]),
  ],
  controllers: [ChatController],

  providers: [
    ChatService,
    ChatsRepository,
    UnreadCounterService,
    ChatCleanupService,
    UnreadGlobalMessage,
    {
      provide: 'COUNTER_STRATEGIES',
      useValue: {
        generalLanguageStrategy,
        teacherLanguageStrategy,
        randomRoomStrategy,
      },
    },
  ],
  exports: [
    ChatsRepository,
    UnreadCounterService,
    'COUNTER_STRATEGIES',
    TypeOrmModule,
  ],

})
export class ChatModule {}
