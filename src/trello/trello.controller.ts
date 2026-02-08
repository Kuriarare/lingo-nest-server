import { Controller, Get, Post, Body, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { TrelloService } from './trello.service';
import axios from 'axios';

@Controller('trello')
export class TrelloController {
  constructor(private readonly trelloService: TrelloService) {}

  // Endpoint to get a user's Trello token by email
  @Get('token')
  async getTrelloToken(@Query('email') email: string, @Res() res: Response) {
    const token = this.trelloService.getTokenByEmail(email);
    
    if (token) {
      return res.status(HttpStatus.OK).json({ 
        success: true, 
        token 
      });
    } else {
      return res.status(HttpStatus.OK).json({ 
        success: false, 
        message: 'No Trello token found for this user.',
        token: null
      });
    }
  }

  // Endpoint to start Trello OAuth for a user
  @Get('auth')
  async startTrelloOAuth(@Query('email') email: string, @Res() res: Response) {
    const authUrl = this.trelloService.getOAuthUrl(email);
    return res.status(HttpStatus.OK).json({ url: authUrl });
  }

  // Endpoint para guardar el token de Trello por email
  @Post('save-token')
  async saveTrelloToken(
    @Body('email') email: string,
    @Body('token') token: string,
    @Res() res: Response
  ) {
    if (!email || !token) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email and token are required.' });
    }
    this.trelloService.saveToken(email, token);
    return res.status(HttpStatus.OK).json({ message: 'Token saved successfully.' });
  }

  // Endpoint para obtener boards de Trello
  @Get('boards')
  async getTrelloBoards(@Query('email') email: string, @Res() res: Response) {
    try {
      const token = this.trelloService.getTokenByEmail(email);
      
      if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No Trello token found. Please authenticate first.'
        });
      }
      
      const apiKey = process.env.TRELLO_API_KEY || 'ad2a9d90ff6ceaa7a8f2b3de101ec095';
      const url = `https://api.trello.com/1/members/me/boards`;
      
      const response = await axios.get(url, {
        params: {
          key: apiKey,
          token: token,
          fields: 'id,name,url'
        }
      });
      
      return res.status(HttpStatus.OK).json({
        success: true,
        boards: response.data
      });
      
    } catch (error) {
      console.error('Error getting Trello boards:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error getting Trello boards'
      });
    }
  }

  // Endpoint para obtener listas de un board
  @Get('lists')
  async getTrelloLists(
    @Query('email') email: string,
    @Query('boardId') boardId: string,
    @Res() res: Response
  ) {
    try {
      const token = this.trelloService.getTokenByEmail(email);
      
      if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No Trello token found.'
        });
      }
      
      const apiKey = process.env.TRELLO_API_KEY || 'ad2a9d90ff6ceaa7a8f2b3de101ec095';
      const url = `https://api.trello.com/1/boards/${boardId}/lists`;
      
      const response = await axios.get(url, {
        params: {
          key: apiKey,
          token: token,
          fields: 'id,name'
        }
      });
      
      return res.status(HttpStatus.OK).json({
        success: true,
        lists: response.data
      });
      
    } catch (error) {
      console.error('Error getting Trello lists:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error getting Trello lists'
      });
    }
  }

  // Endpoint para crear tarjeta
  @Post('create-card')
  async createTrelloCard(
    @Body('email') email: string,
    @Body('listId') listId: string,
    @Body('name') name: string,
    @Body('description') description: string,
    @Res() res: Response
  ) {
    try {
      const token = this.trelloService.getTokenByEmail(email);
      
      if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No Trello token found.'
        });
      }
      
      const apiKey = process.env.TRELLO_API_KEY || 'ad2a9d90ff6ceaa7a8f2b3de101ec095';
      const url = `https://api.trello.com/1/cards`;
      
      const response = await axios.post(url, null, {
        params: {
          key: apiKey,
          token: token,
          idList: listId,
          name: name,
          desc: description || ''
        }
      });
      
      return res.status(HttpStatus.OK).json({
        success: true,
        card: response.data
      });
      
    } catch (error) {
      console.error('Error creating Trello card:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error creating Trello card'
      });
    }
  }

  // ✅ AÑADE ESTO AL FINAL - Endpoint para obtener tarjetas de una lista
  @Get('cards')
  async getTrelloCards(
    @Query('email') email: string,
    @Query('listId') listId: string,
    @Res() res: Response
  ) {
    try {
      const token = this.trelloService.getTokenByEmail(email);
      
      if (!token) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'No Trello token found.'
        });
      }
      
      const apiKey = process.env.TRELLO_API_KEY || 'ad2a9d90ff6ceaa7a8f2b3de101ec095';
      const url = `https://api.trello.com/1/lists/${listId}/cards`;
      
      const response = await axios.get(url, {
        params: {
          key: apiKey,
          token: token,
          fields: 'id,name,desc,due,url'
        }
      });
      
      return res.status(HttpStatus.OK).json({
        success: true,
        cards: response.data
      });
      
    } catch (error) {
      console.error('Error getting Trello cards:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Error getting Trello cards'
      });
    }
  }
}  // ← ESTA ES LA ÚLTIMA LLAVE QUE CIERRA LA CLASE