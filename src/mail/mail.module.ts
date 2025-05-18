import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: '.env.development.development' });

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('mail.mailHost'),
          port: 587,
          secure: false,
          auth: {
            user: config.get('mail.smtpUsername'),
            pass: config.get('mail.smtpPassword'),
          },
        },
        defaults: {
          from: `Lingolandias <no-reply@lingolandias.com>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new EjsAdapter({ inlineCssEnabled: true }),
          options: {
            strict: false,
            cache: false,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
