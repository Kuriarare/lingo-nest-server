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

@Module({
  imports: [TypeOrmModule.forFeature([User, Schedule, Chat])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    ScheduleRepository,
    VideoCallsGateway,
    ChatsRepository,
  ],
})
export class AuthModule {}
