import { Injectable, Logger } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
import { MailerService } from '@nestjs-modules/mailer';
dotenvConfig({ path: '.env.development.development' });

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  public async sendUserWelcomeEmail(
    name: string,
    email: string,
    password: string,
  ) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to Lingolandias',
        template: './welcome',
        context: {
          email: email,
          name: name,
          password: password,
        },
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${email}`,
        error.stack,
      );
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}
