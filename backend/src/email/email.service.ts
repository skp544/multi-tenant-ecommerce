import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { otpEmailTemplate } from './otp-email.template.js';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;

  private readonly fromEmail: string;

  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    // MailHog for local dev: SMTP on 1025, no auth, inbox UI on http://localhost:8025
    this.transporter = nodemailer.createTransport({
      host: this.config.getOrThrow('MAIL_HOST'),
      port: Number(this.config.getOrThrow('MAIL_PORT')),
      secure: false,
    });
    this.fromEmail = this.config.getOrThrow('MAIL_FROM');
  }

  async sendOTP2FA(
    username: string,
    toEmail: string,
    otp: string,
    expiresIn: string,
  ) {
    this.logger.log(`Sending 2FA email to ${toEmail}`);

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: toEmail,
        subject: 'Your 2FA verification code',
        html: otpEmailTemplate(username, otp, expiresIn),
      });
    } catch (error) {
      this.logger.error(`Sending email failed: ${(error as Error).message}`);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }
}
