// reset-password.dto.ts
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
