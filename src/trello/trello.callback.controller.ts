import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TrelloService } from './trello.service';

@Controller('trello')
export class TrelloCallbackController {
  constructor(private readonly trelloService: TrelloService) {}

  // Endpoint para manejar el callback de Trello OAuth y guardar el token automáticamente
  @Get('callback')
  async trelloCallback(
    @Query('token') token: string,
    @Query('email') email: string,
    @Res() res: Response
  ) {
    if (!token || !email) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Token and email are required.' });
    }
    this.trelloService.saveToken(email, token);
    // Redirige al frontend con éxito
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/trello?success=1`);
  }
}
