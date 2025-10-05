import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule, User } from './entities/user.entity';
import { Settings } from './entities/settings.entity';
import { UsersRepository } from './users.repository';
import { ScheduleRepository } from './schedule.repository';
import { UnreadGlobalMessage } from 'src/chat/entities/unread-global-messages.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Schedule, UnreadGlobalMessage, Settings]),
  ],

  controllers: [UsersController],
  providers: [UsersService, UsersRepository, ScheduleRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
