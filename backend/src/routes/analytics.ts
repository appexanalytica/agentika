import { Router } from 'express';
import Lead from '../models/Lead.js';
import Deal from '../models/Deal.js';
import Task from '../models/Task.js';
import BlogPost from '../models/BlogPost.js';
import EmailMessage from '../models/EmailMessage.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import type { SuccessResponse, ErrorResponse } from '../types/index.js';

const router = Router();

// Dashboard overview
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalLeads,
      newLeads7Days,
      newLeads30Days,
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      pendingTasks,
      overdueTasks,
      completedTasks,
      publishedPosts,
      totalViews,
      emailsSent,
    ] = await Promise.all([
      Lead.countDocuments({}),
      Lead.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Deal.countDocuments({}),
      Deal.countDocuments({ status: 'open' }),
      Deal.countDocuments({ status: 'won' }),
      Deal.countDocuments({ status: 'lost' }),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'overdue', dueDate: { $lt: now } }),
      Task.countDocuments({ status: 'completed' }),
      BlogPost.countDocuments({ status: 'published' }),
      BlogPost.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      EmailMessage.countDocuments({ direction: 'outbound' }),
    ]);

    const totalViewsValue = totalViews[0]?.total || 0;

    // Pipeline value
    const pipelineValue = await Deal.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Leads by status
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Leads by source
    const leadsBySource = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        leads: {
          total: totalLeads,
          new7Days: newLeads7Days,
          new30Days: newLeads30Days,
          byStatus: leadsByStatus,
          bySource: leadsBySource,
        },
        deals: {
          total: totalDeals,
          open: openDeals,
          won: wonDeals,
          lost: lostDeals,
          pipelineValue: pipelineValue[0]?.total || 0,
        },
        tasks: {
          pending: pendingTasks,
          overdue: overdueTasks,
          completed: completedTasks,
        },
        blog: {
          published: publishedPosts,
          totalViews: totalViewsValue,
        },
        email: {
          sent: emailsSent,
        },
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
    } as ErrorResponse);
  }
});

// Leads analytics
router.get('/leads', authenticate, requireAdmin, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const match: any = {};
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) match.createdAt.$lte = new Date(dateTo as string);
    }

    const [byStatus, bySource, byPriority, byAssignedTo] = await Promise.all([
      Lead.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: match }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: match }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: match }, { $group: { _id: '$assignedTo', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        byStatus,
        bySource,
        byPriority,
        byAssignedTo,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leads analytics',
    } as ErrorResponse);
  }
});

// Deals analytics
router.get('/deals', authenticate, requireAdmin, async (req, res) => {
  try {
    const [byStage, byStatus, forecast] = await Promise.all([
      Deal.aggregate([
        { $lookup: { from: 'pipelinestages', localField: 'stage', foreignField: '_id', as: 'stageInfo' } },
        { $unwind: '$stageInfo' },
        { $group: { _id: '$stageInfo.name', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      Deal.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }]),
      Deal.aggregate([
        { $match: { status: 'open', expectedCloseDate: { $gte: new Date() } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        byStage,
        byStatus,
        forecast: forecast[0]?.total || 0,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching deals analytics',
    } as ErrorResponse);
  }
});

// Tasks analytics
router.get('/tasks', authenticate, requireAdmin, async (req, res) => {
  try {
    const now = new Date();
    const [byStatus, byPriority, byType, overdueCount] = await Promise.all([
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Task.countDocuments({ status: 'pending', dueDate: { $lt: now } }),
    ]);

    res.json({
      success: true,
      data: {
        byStatus,
        byPriority,
        byType,
        overdue: overdueCount,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks analytics',
    } as ErrorResponse);
  }
});

// Blog analytics
router.get('/blog', authenticate, requireAdmin, async (req, res) => {
  try {
    const [totalPosts, byStatus, topPosts, totalViews] = await Promise.all([
      BlogPost.countDocuments({}),
      BlogPost.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      BlogPost.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(10)
        .select('title slug views publishedAt'),
      BlogPost.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    ]);

    res.json({
      success: true,
      data: {
        total: totalPosts,
        byStatus,
        topPosts,
        totalViews: totalViews[0]?.total || 0,
      },
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog analytics',
    } as ErrorResponse);
  }
});

export default router;
