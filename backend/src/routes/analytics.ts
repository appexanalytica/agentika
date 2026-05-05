import { Router } from 'express';
import AnalyticsController from '../controllers/AnalyticsController';
import { optionalAuthMiddleware, authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Public route - record visit
router.post(
  '/visit',
  optionalAuthMiddleware,
  (req, res, next) => AnalyticsController.recordVisit(req, res, next)
);

// Protected routes - require admin
router.get(
  '/visits',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getVisitsByDateRange(req, res, next)
);

router.get(
  '/total',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getTotalVisits(req, res, next)
);

router.get(
  '/top-pages',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getTopPages(req, res, next)
);

router.get(
  '/dashboard',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getDashboardMetrics(req, res, next)
);

router.get(
  '/leads-by-status',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getLeadsByStatus(req, res, next)
);

router.get(
  '/pipeline-value',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getPipelineValue(req, res, next)
);

router.get(
  '/top-blog-posts',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getTopBlogPosts(req, res, next)
);

router.get(
  '/referrers',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => AnalyticsController.getReferrers(req, res, next)
);

export default router;
