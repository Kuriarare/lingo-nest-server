import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as https from 'https';

async function bootstrap() {
  // HTTPS options with your certificate paths
  const httpsOptions = {
    key: fs.readFileSync(
      '/etc/letsencrypt/live/srv570363.hstgr.cloud-0001/privkey.pem',
    ),
    cert: fs.readFileSync(
      '/etc/letsencrypt/live/srv570363.hstgr.cloud-0001/fullchain.pem',
    ),
  };

  const app = await NestFactory.create(AppModule);

  // Enable CORS for all origins
  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  // Create an HTTPS server and listen on port 8000
  const httpsServer = https.createServer(
    httpsOptions,
    app.getHttpAdapter().getInstance(),
  );

  // Start the server
  httpsServer.listen(8000, () => {
    console.log('NestJS application is running on https://localhost:8000');
  });
}

bootstrap();
