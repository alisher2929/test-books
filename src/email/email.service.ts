import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private _configService: ConfigService,
    private _mailerService: MailerService,
  ) {}

  async sendMail(to: string, subject: string, text: string) {
    const mailOptions = {
      from: this._configService.get<string>('EMAIL_USER'),
      to,
      subject,
      text,
    };

    return this._mailerService.sendMail(mailOptions);
  }
}
