import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Settings } from '../users/entities/settings.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Settings, User])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}