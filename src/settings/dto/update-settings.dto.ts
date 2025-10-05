import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsBoolean()
  @IsOptional()
  darkMode?: boolean;

  @IsString()
  @IsOptional()
  language?: string;
}