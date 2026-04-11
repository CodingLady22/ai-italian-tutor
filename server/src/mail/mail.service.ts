import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
    
  }

  async onModuleInit() {
    // Verify transporter on startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Mail Transporter Error:', error);
      } else {
        console.log('Mail Server is ready to take messages');
      }
    });
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify?token=${token}`;
    const mailFrom = this.configService.get<string>('MAIL_FROM');

    try {
      const info = await this.transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: 'Verify your email for AI Italian Tutor',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #10b981; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">AI Italian Tutor</h1>
            </div>
            <div style="padding: 30px; background-color: white;">
              <h2 style="color: #059669;">Ciao ${name}!</h2>
              <p style="font-size: 16px; color: #374151; line-height: 1.5;">Benvenuto nell'app AI Italian Tutor. Per favore, clicca sul link qui sotto per verificare la tua email e iniziare a fare pratica:</p>
              <div style="margin: 35px 0; text-align: center;">
                <a href="${verificationUrl}" style="padding: 14px 28px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verifica la mia email</a>
              </div>
              <p style="font-size: 14px; color: #6b7280;">Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
              <p style="font-size: 14px; color: #10b981; word-break: break-all;">${verificationUrl}</p>
              <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
              <p style="font-size: 14px; color: #9ca3af; text-align: center;">A presto!<br>Il team di AI Italian Tutor</p>
            </div>
          </div>
        `,
      });

      console.log('Verification email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }
}
