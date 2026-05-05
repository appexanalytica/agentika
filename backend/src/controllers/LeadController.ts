import { Request, Response, NextFunction } from 'express';
import LeadService from '../services/LeadService';
import { body } from 'express-validator';

export const createLeadValidationRules = () => [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('message').notEmpty().trim(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
];

export class LeadController {
  async createLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        name, 
        email, 
        phone, 
        company, 
        message, 
        source 
      } = req.body;

      const lead = await LeadService.createLead({
        name,
        email,
        phone,
        company,
        message,
        source: source || 'web',
      });

      res.status(201).json({
        message: 'Lead created successfully',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllLeads(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await LeadService.getAllLeads(page, limit, status);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leadId } = req.params;

      const lead = await LeadService.getLeadById(leadId);

      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      res.status(200).json({
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leadId } = req.params;
      const updateData = req.body;

      const lead = await LeadService.updateLead(leadId, updateData);

      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      res.status(200).json({
        message: 'Lead updated successfully',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLeadStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leadId } = req.params;
      const { status } = req.body;

      const lead = await LeadService.updateLeadStatus(leadId, status);

      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      res.status(200).json({
        message: 'Lead status updated successfully',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async addLeadNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leadId } = req.params;
      const { text, author } = req.body;

      const lead = await LeadService.addLeadNote(leadId, {
        id: crypto.randomUUID(),
        text,
        author: author || 'Admin',
      });

      if (!lead) {
        res.status(404).json({ error: 'Lead not found' });
        return;
      }

      res.status(200).json({
        message: 'Note added successfully',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { leadId } = req.params;

      await LeadService.deleteLead(leadId);

      res.status(200).json({
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LeadController();
