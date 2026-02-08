import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import TypeOrmConfig from './config/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from './users/users.module';
import { UploadFilesModule } from './upload-files/upload-files.module';
import { MailModule } from './mail/mail.module';
import mailConfig from './config/mail.config';
import { ScheduleModule } from '@nestjs/schedule';
import { SettingsModule } from './settings/settings.module';
import { TrelloModule } from './trello/trello.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [TypeOrmConfig, mailConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '8h' },
    }),
    AuthModule,
    ChatModule,
    UsersModule,
    UploadFilesModule,
    MailModule,
    SettingsModule,
    TrelloModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
