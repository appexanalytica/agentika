import { Request, Response, NextFunction } from 'express';
import { Email } from '../models/Email';
import { smtpService } from '../services/SmtpService';
import { imapService } from '../services/ImapService';

export class EmailController {
  // Get inbox emails
  async getInbox(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, unread = false } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const query: any = { folder: 'inbox', direction: 'inbound' };
      if (unread === 'true') {
        query.read = false;
      }

      const emails = await Email.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Email.countDocuments(query);

      res.status(200).json({
        emails,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get sent emails
  async getSent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const emails = await Email.find({ folder: 'sent', direction: 'outbound' })
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Email.countDocuments({ folder: 'sent', direction: 'outbound' });

      res.status(200).json({
        emails,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get emails by folder
  async getByFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { folder } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const validFolders = ['inbox', 'sent', 'drafts', 'archive', 'trash'];
      if (!validFolders.includes(folder)) {
        res.status(400).json({ message: 'Invalid folder' });
        return;
      }

      const emails = await Email.find({ folder })
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Email.countDocuments({ folder });

      res.status(200).json({
        emails,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single email by ID
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const email = await Email.findById(id);

      if (!email) {
        res.status(404).json({ message: 'Email not found' });
        return;
      }

      res.status(200).json({ email });
    } catch (error) {
      next(error);
    }
  }

  // Send new email
  async sendEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { to, subject, text, html, attachments } = req.body;

      if (!to || !subject) {
        res.status(400).json({ message: 'To and subject are required' });
        return;
      }

      const result = await smtpService.sendEmail({
        to,
        subject,
        text,
        html,
        attachments,
      });

      res.status(200).json({
        message: 'Email sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Reply to email
  async replyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { text, html } = req.body;

      const originalEmail = await Email.findById(id);
      if (!originalEmail) {
        res.status(404).json({ message: 'Original email not found' });
        return;
      }

      const subject = originalEmail.subject.startsWith('Re:')
        ? originalEmail.subject
        : `Re: ${originalEmail.subject}`;

      const references = originalEmail.references
        ? [...originalEmail.references, originalEmail.messageId]
        : [originalEmail.messageId];

      const result = await smtpService.sendEmail({
        to: originalEmail.from,
        subject,
        text,
        html,
        inReplyTo: originalEmail.messageId,
        references,
      });

      res.status(200).json({
        message: 'Reply sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Sync emails from IMAP
  async syncEmails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { limit = 50 } = req.body;
      const result = await imapService.syncInbox(Number(limit));

      res.status(200).json({
        message: 'Sync completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Mark email as read/unread
  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { read = true } = req.body;

      const email = await Email.findByIdAndUpdate(
        id,
        { read },
        { new: true }
      );

      if (!email) {
        res.status(404).json({ message: 'Email not found' });
        return;
      }

      res.status(200).json({
        message: 'Email updated',
        data: email,
      });
    } catch (error) {
      next(error);
    }
  }

  // Move email to folder
  async moveToFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { folder } = req.body;

      const validFolders = ['inbox', 'sent', 'drafts', 'archive', 'trash'];
      if (!validFolders.includes(folder)) {
        res.status(400).json({ message: 'Invalid folder' });
        return;
      }

      const email = await Email.findByIdAndUpdate(
        id,
        { folder },
        { new: true }
      );

      if (!email) {
        res.status(404).json({ message: 'Email not found' });
        return;
      }

      res.status(200).json({
        message: 'Email moved',
        data: email,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete email
  async deleteEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const email = await Email.findById(id);
      if (!email) {
        res.status(404).json({ message: 'Email not found' });
        return;
      }

      // If not in trash, move to trash
      if (email.folder !== 'trash') {
        email.folder = 'trash';
        await email.save();
        res.status(200).json({
          message: 'Email moved to trash',
          data: email,
        });
        return;
      }

      // If in trash, permanently delete
      await Email.findByIdAndDelete(id);
      res.status(200).json({ message: 'Email permanently deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Get unread count
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await Email.countDocuments({
        folder: 'inbox',
        direction: 'inbound',
        read: false,
      });

      res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  }

  // Test email configuration
  async testConfig(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const smtpOk = await smtpService.verifyConnection();
      const imapOk = await imapService.testConnection();

      res.status(200).json({
        smtp: smtpOk ? 'connected' : 'failed',
        imap: imapOk ? 'connected' : 'failed',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const emailController = new EmailController();
