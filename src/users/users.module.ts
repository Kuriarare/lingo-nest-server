import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule, User } from './entities/user.entity';
import { UsersRepository } from './users.repository';
import { ScheduleRepository } from './schedule.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Schedule])],

  controllers: [UsersController],
  providers: [UsersService, UsersRepository, ScheduleRepository],
  exports: [UsersRepository],
})
export class UsersModule {}
