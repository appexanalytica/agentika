import { Router } from 'express';
import Lead from '../models/Lead.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import { publicFormRateLimit } from '../middleware/rateLimit.js';
import { body } from 'express-validator';
import type { SuccessResponse, ErrorResponse } from '../types/index.js';

const router = Router();

// Public contact form - creates a lead
router.post('/contact', publicFormRateLimit, body('email').isEmail(), body('name').notEmpty(), async (req, res) => {
  try {
    const { name, email, phone, company, message, interest, sourcePage } = req.body;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const lead = await Lead.create({
      firstName: firstName || name,
      lastName: lastName || '',
      email,
      phone,
      companyName: company,
      message,
      interest: interest || 'other',
      source: sourcePage ? 'website' : 'manual',
      status: 'new',
      priority: 'medium',
    });

    await ActivityLog.create({
      actor: lead._id,
      action: 'create',
      entityType: 'Lead',
      entityId: lead._id,
      description: `New lead from public contact form: ${name}`,
      metadata: { source: 'public_form', sourcePage },
    });

    // Notify admins
    // In production, you might want to find all admins and notify them

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will contact you soon.',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error submitting form',
    } as ErrorResponse);
  }
});

// Newsletter subscription
router.post('/newsletter', publicFormRateLimit, body('email').isEmail(), async (req, res) => {
  try {
    const { email } = req.body;

    // In production, you might want to create a Newsletter model
    // For now, we'll just acknowledge the subscription

    res.json({
      success: true,
      message: 'Thank you for subscribing to our newsletter.',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error subscribing to newsletter',
    } as ErrorResponse);
  }
});

// Demo request
router.post('/demo-request', publicFormRateLimit, body('email').isEmail(), body('name').notEmpty(), async (req, res) => {
  try {
    const { name, email, phone, company, message, interest } = req.body;

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ');

    const lead = await Lead.create({
      firstName: firstName || name,
      lastName: lastName || '',
      email,
      phone,
      companyName: company,
      message: message || 'Demo request',
      interest: interest || 'software_factory',
      source: 'website',
      status: 'new',
      priority: 'high',
    });

    await ActivityLog.create({
      actor: lead._id,
      action: 'create',
      entityType: 'Lead',
      entityId: lead._id,
      description: `Demo request from: ${name}`,
      metadata: { source: 'demo_request' },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your interest. We will contact you to schedule a demo.',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error submitting demo request',
    } as ErrorResponse);
  }
});

export default router;
