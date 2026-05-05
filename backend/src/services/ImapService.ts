import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';
import { Email } from '../models/Email';

class ImapService {
  private client: ImapFlow | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  private getClient() {
    if (!this.client) {
      this.client = new ImapFlow({
        host: process.env.IMAP_HOST || 'localhost',
        port: parseInt(process.env.IMAP_PORT || '993'),
        secure: process.env.IMAP_SECURE === 'true',
        auth: {
          user: process.env.MAIL_ADDRESS || '',
          pass: process.env.MAIL_PASSWORD || '',
        },
      });
    }
    return this.client;
  }

  async connect(): Promise<boolean> {
    try {
      const client = this.getClient();
      await client.connect();
      console.log('IMAP connected successfully');
      return true;
    } catch (error) {
      console.error('IMAP connection failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.logout();
        this.client = null;
      }
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
    } catch (error) {
      console.error('IMAP disconnect error:', error);
    }
  }

  private async parseEmail(raw: Buffer): Promise<ParsedMail> {
    return await simpleParser(raw);
  }

  private async saveEmailToDb(parsed: ParsedMail, messageId: string): Promise<void> {
    // Check if email already exists
    const existing = await Email.findOne({ messageId });
    if (existing) {
      return;
    }

    const email = new Email({
      messageId,
      from: parsed.from?.text || 'unknown',
      to: parsed.to?.text ? [parsed.to.text] : [],
      subject: parsed.subject || '(No subject)',
      text: parsed.text || '',
      html: parsed.html || '',
      date: parsed.date || new Date(),
      folder: 'inbox',
      read: false,
      direction: 'inbound',
      attachments: parsed.attachments?.map(att => ({
        filename: att.filename || 'unnamed',
        contentType: att.contentType || 'application/octet-stream',
        size: att.size || 0,
        contentId: att.contentId,
      })) || [],
      inReplyTo: parsed.inReplyTo,
      references: parsed.references,
    });

    await email.save();
    console.log(`Saved email: ${email.subject}`);
  }

  async syncInbox(limit: number = 50): Promise<{ synced: number; errors: number }> {
    let synced = 0;
    let errors = 0;

    try {
      const client = this.getClient();
      
      // Ensure connected
      if (!client.mailbox) {
        await this.connect();
      }

      const mailbox = await client.mailboxOpen('INBOX');
      
      // Fetch recent emails
      const messages = await client.fetch(
        { seq: Math.max(1, mailbox.exists - limit + 1) + ':' + mailbox.exists },
        { source: true, envelope: true, flags: true }
      );

      for await (const message of messages) {
        try {
          const messageId = message.envelope?.messageId || `imap-${Date.now()}-${synced}`;
          
          if (message.source) {
            const parsed = await this.parseEmail(message.source);
            await this.saveEmailToDb(parsed, messageId);
            synced++;
          }
        } catch (error) {
          console.error('Error processing email:', error);
          errors++;
        }
      }

      console.log(`IMAP sync completed: ${synced} synced, ${errors} errors`);
    } catch (error) {
      console.error('IMAP sync error:', error);
      errors++;
    }

    return { synced, errors };
  }

  async startAutoSync(intervalMinutes: number = 5): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Initial sync
    await this.syncInbox();

    // Set up recurring sync
    this.syncInterval = setInterval(async () => {
      console.log('Running scheduled IMAP sync...');
      await this.syncInbox();
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-sync started with ${intervalMinutes} minute interval`);
  }

  async stopAutoSync(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      if (connected) {
        await this.disconnect();
      }
      return connected;
    } catch (error) {
      console.error('IMAP test connection failed:', error);
      return false;
    }
  }
}

export const imapService = new ImapService();
