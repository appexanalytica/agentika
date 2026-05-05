import { Request, Response, NextFunction } from 'express';
import AnalyticsService from '../services/AnalyticsService';

export class AnalyticsController {
  async recordVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, path } = req.body;
      const userAgent = req.headers['user-agent'];
      const referrer = req.headers.referer;
      const ip = req.ip;

      const visit = await AnalyticsService.recordVisit({
        page,
        path,
        userAgent,
        referrer,
        ip,
      });

      res.status(201).json({
        message: 'Visit recorded successfully',
        data: visit,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVisitsByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 14;

      const data = await AnalyticsService.getVisitsByDateRange(days);

      res.status(200).json({
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTotalVisits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const total = await AnalyticsService.getTotalVisits(days);

      res.status(200).json({
        data: { total },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopPages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const topPages = await AnalyticsService.getTopPages(limit);

      res.status(200).json({
        data: topPages,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const metrics = await AnalyticsService.getDashboardMetrics(days);

      res.status(200).json({
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLeadsByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;

      const data = await AnalyticsService.getLeadsByStatus(days);

      res.status(200).json({
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPipelineValue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getPipelineValue();

      res.status(200).json({
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopBlogPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      const data = await AnalyticsService.getTopBlogPosts(limit);

      res.status(200).json({
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReferrers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const limit = parseInt(req.query.limit as string) || 10;

      const data = await AnalyticsService.getReferrers(days, limit);

      res.status(200).json({
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();
