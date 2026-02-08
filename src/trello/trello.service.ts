import { Injectable } from '@nestjs/common';

@Injectable()
export class TrelloService {
  // Almacenamiento en memoria
  private tokenStore = new Map<string, string>();

  getOAuthUrl(email: string): string {
    const apiKey = process.env.TRELLO_API_KEY || 'ad2a9d90ff6ceaa7a8f2b3de101ec095';
    const redirectUrl = encodeURIComponent(process.env.FRONTEND_URL || 'http://localhost:5173');
    
    return `https://trello.com/1/authorize?` +
      `expiration=never` +
      `&name=TuApp` +
      `&scope=read,write` +
      `&response_type=token` +
      `&key=${apiKey}` +
      `&return_url=${redirectUrl}`;
  }

  saveToken(email: string, token: string): void {
    this.tokenStore.set(email, token);
    console.log(`Token saved for ${email}`);
  }

  getTokenByEmail(email: string): string | undefined {
    return this.tokenStore.get(email);
  }
}