import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Schedule, User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/users.repository';
import { ScheduleRepository } from 'src/users/schedule.repository';
import { VideoCallsGateway } from 'src/videocalls.gateaway';
import { Chat } from 'src/chat/entities/chat.entity';
import { ChatsRepository } from 'src/chat/chats.repository';
import { MailService } from 'src/mail/mail.service';
import { GlobalChat } from 'src/chat/entities/global-chat.entity';
import { UsersModule } from 'src/users/users.module';
import { UnreadGlobalMessage } from 'src/chat/entities/unread-global-messages.entity';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Schedule,
      Chat,
      GlobalChat,
      UnreadGlobalMessage,
    ]),
    UsersModule,
    ChatModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    ScheduleRepository,
    VideoCallsGateway,
    ChatsRepository,
    MailService,
  ],
})
export class AuthModule {}
