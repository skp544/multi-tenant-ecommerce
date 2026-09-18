import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { otpEmailTemplate } from './otp-email.template.js';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  private readonly fromEmail: string;

  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.getOrThrow('RESEND_API_KEY'));
    this.fromEmail = this.config.getOrThrow('RESEND_FROM_EMAIL');
  }

  async sendOTP2FA(
    username: string,
    toEmail: string,
    otp: string,
    expiresIn: string,
  ) {
    this.logger.log(`Sending 2FA email to ${toEmail}`);

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: toEmail,
      subject: 'Your 2FA verification code',
      html: otpEmailTemplate(username, otp, expiresIn),
    });

    if (error) {
      this.logger.error(`Resend send failed: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }
}
