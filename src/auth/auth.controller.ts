import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

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
}
