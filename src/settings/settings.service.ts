import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../users/entities/settings.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async update(
    userId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<Settings> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['settings'],
    });

    if (!user.settings) {
      const newSettings = this.settingsRepository.create({
        ...updateSettingsDto,
        user,
      });
      await this.settingsRepository.save(newSettings);
      return newSettings;
    }

    Object.assign(user.settings, updateSettingsDto);
    return this.settingsRepository.save(user.settings);
  }
}