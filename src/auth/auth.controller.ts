import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() newUser: any) {
    return this.authService.register(newUser);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() credentials: any) {
    const { email, password } = credentials;
    return this.authService.login(email, password);
  }

  @Post('logout')
  async logout(@Body('userId') userId: string) {
    return this.authService.logout(userId);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.setNewPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
      resetPasswordDto.confirmPassword,
    );
  }

  @Get('verify-reset-token/:token')
  async verifyResetToken(@Param('token') token: string) {
    return this.authService.verifyResetToken(token);
  }
}
