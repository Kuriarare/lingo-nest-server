import { Controller, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(AuthGuard)
  @Patch()
  update(@Req() request, @Body() updateSettingsDto: UpdateSettingsDto) {
    const { id } = request.user;
    return this.settingsService.update(id, updateSettingsDto);
  }
}