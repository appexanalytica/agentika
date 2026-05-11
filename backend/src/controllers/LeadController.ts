import { Response } from 'express';
import Lead from '../models/Lead.js';
import ActivityLog from '../models/ActivityLog.js';
import Notification from '../models/Notification.js';
import { getPaginationParams, buildFilterQuery, generateSlug } from '../utils/helpers.js';
import type { AuthenticatedRequest, PaginatedResponse, SuccessResponse, ErrorResponse } from '../types/index.js';

const logActivity = async (actor: string, action: string, entityId: string, description: string, metadata?: any) => {
  await ActivityLog.create({
    actor,
    action,
    entityType: 'Lead',
    entityId,
    description,
    metadata,
  });
};

export const getLeads = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const filter = buildFilterQuery(req.query, Lead.schema);

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(filter);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    } as PaginatedResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leads',
    } as ErrorResponse);
  }
};

export const getLeadById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'username firstName lastName')
      .populate('createdBy', 'username firstName lastName');

    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found',
      } as ErrorResponse);
      return;
    }

    res.json({
      success: true,
      data: lead,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lead',
    } as ErrorResponse);
  }
};

export const createLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const leadData = req.body;
    leadData.createdBy = req.user!._id;

    // Check for duplicates by email
    if (leadData.email) {
      const existing = await Lead.findOne({ email: leadData.email });
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Lead with this email already exists',
        } as ErrorResponse);
        return;
      }
    }

    const lead = await Lead.create(leadData);

    await logActivity(
      req.user!._id.toString(),
      'create',
      lead._id.toString(),
      `Created new lead: ${lead.firstName} ${lead.lastName}`,
      { email: lead.email, source: lead.source }
    );

    // Create notification for assigned user
    if (lead.assignedTo) {
      await Notification.create({
        user: lead.assignedTo,
        type: 'new_lead',
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${lead.firstName} ${lead.lastName}`,
        priority: 'medium',
        relatedToType: 'lead',
        relatedToId: lead._id,
      });
    }

    res.status(201).json({
      success: true,
      data: lead,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating lead',
    } as ErrorResponse);
  }
};

export const updateLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found',
      } as ErrorResponse);
      return;
    }

    const oldStatus = lead.status;
    const oldAssignedTo = lead.assignedTo?.toString();

    Object.assign(lead, req.body);
    await lead.save();

    await logActivity(
      req.user!._id.toString(),
      'update',
      lead._id.toString(),
      `Updated lead: ${lead.firstName} ${lead.lastName}`,
      { changes: req.body }
    );

    // Create notification if status changed
    if (oldStatus !== lead.status) {
      await Notification.create({
        user: lead.assignedTo || req.user!._id,
        type: 'lead_followup',
        title: 'Lead Status Changed',
        message: `Lead ${lead.firstName} ${lead.lastName} status changed from ${oldStatus} to ${lead.status}`,
        priority: 'medium',
        relatedToType: 'lead',
        relatedToId: lead._id,
      });
    }

    // Create notification if assigned
    if (lead.assignedTo && oldAssignedTo !== lead.assignedTo.toString()) {
      await Notification.create({
        user: lead.assignedTo,
        type: 'new_lead',
        title: 'Lead Assigned',
        message: `You have been assigned lead: ${lead.firstName} ${lead.lastName}`,
        priority: 'medium',
        relatedToType: 'lead',
        relatedToId: lead._id,
      });
    }

    res.json({
      success: true,
      data: lead,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating lead',
    } as ErrorResponse);
  }
};

export const deleteLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found',
      } as ErrorResponse);
      return;
    }

    await Lead.findByIdAndDelete(req.params.id);

    await logActivity(
      req.user!._id.toString(),
      'delete',
      lead._id.toString(),
      `Deleted lead: ${lead.firstName} ${lead.lastName}`
    );

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting lead',
    } as ErrorResponse);
  }
};

export const updateLeadStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found',
      } as ErrorResponse);
      return;
    }

    lead.status = status;
    await lead.save();

    await logActivity(
      req.user!._id.toString(),
      'status_change',
      lead._id.toString(),
      `Lead status changed to ${status}`,
      { oldStatus: lead.status, newStatus: status }
    );

    res.json({
      success: true,
      data: lead,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating lead status',
    } as ErrorResponse);
  }
};

export const assignLead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { assignedTo } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found',
      } as ErrorResponse);
      return;
    }

    lead.assignedTo = assignedTo;
    await lead.save();

    await logActivity(
      req.user!._id.toString(),
      'assign',
      lead._id.toString(),
      `Lead assigned to user`,
      { assignedTo }
    );

    await Notification.create({
      user: assignedTo,
      type: 'new_lead',
      title: 'New Lead Assigned',
      message: `You have been assigned lead: ${lead.firstName} ${lead.lastName}`,
      priority: 'medium',
      relatedToType: 'lead',
      relatedToId: lead._id,
    });

    res.json({
      success: true,
      data: lead,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error assigning lead',
    } as ErrorResponse);
  }
};

export const addLeadNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { note } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        success: false,
        message: 'Lead not found',
      } as ErrorResponse);
      return;
    }

    lead.notes = (lead.notes || '') + `\n\n[${new Date().toISOString()}] ${note}`;
    await lead.save();

    await logActivity(
      req.user!._id.toString(),
      'note',
      lead._id.toString(),
      `Added note to lead`,
      { note }
    );

    res.json({
      success: true,
      data: lead,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error adding note',
    } as ErrorResponse);
  }
};

export const getLeadActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const activities = await ActivityLog.find({
      entityType: 'Lead',
      entityId: req.params.id,
    })
      .populate('actor', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: activities,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching activity',
    } as ErrorResponse);
  }
};
