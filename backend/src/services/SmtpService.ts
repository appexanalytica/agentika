import nodemailer from 'nodemailer';
import { Email } from '../models/Email';

interface SendEmailInput {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  inReplyTo?: string;
  references?: string[];
}

class SmtpService {
  private transporter: nodemailer.Transporter | null = null;

  private getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.MAIL_ADDRESS,
          pass: process.env.MAIL_PASSWORD,
        },
      });
    }
    return this.transporter;
  }

  async sendEmail(input: SendEmailInput): Promise<{ messageId: string; accepted: string[] }> {
    try {
      const transporter = this.getTransporter();
      
      const mailOptions = {
        from: process.env.MAIL_FROM,
        to: Array.isArray(input.to) ? input.to.join(', ') : input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        attachments: input.attachments,
        inReplyTo: input.inReplyTo,
        references: input.references,
      };

      const info = await transporter.sendMail(mailOptions);

      // Save sent email to database
      const email = new Email({
        messageId: info.messageId || `sent-${Date.now()}`,
        from: process.env.MAIL_ADDRESS || 'unknown',
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        text: input.text || '',
        html: input.html || '',
        date: new Date(),
        folder: 'sent',
        read: true,
        direction: 'outbound',
        attachments: input.attachments?.map(att => ({
          filename: att.filename,
          contentType: att.contentType || 'application/octet-stream',
          size: Buffer.isBuffer(att.content) ? att.content.length : att.content.length,
        })) || [],
        inReplyTo: input.inReplyTo,
        references: input.references,
      });

      await email.save();

      return {
        messageId: info.messageId,
        accepted: info.accepted as string[],
      };
    } catch (error) {
      console.error('SMTP send error:', error);
      throw new Error('Failed to send email via SMTP');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP connection verification failed:', error);
      return false;
    }
  }
}

export const smtpService = new SmtpService();
