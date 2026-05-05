import { Router } from 'express';
import LeadController, {
  createLeadValidationRules,
} from '../controllers/LeadController';
import { validationErrorHandler } from '../middleware/errorHandler';
import { authMiddleware, optionalAuthMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Public route - create lead (optional auth)
router.post(
  '/',
  optionalAuthMiddleware,
  createLeadValidationRules(),
  validationErrorHandler,
  (req, res, next) => LeadController.createLead(req, res, next)
);

// Protected routes (require authentication)
router.get(
  '/',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => LeadController.getAllLeads(req, res, next)
);

router.get(
  '/:leadId',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => LeadController.getLead(req, res, next)
);

router.put(
  '/:leadId',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => LeadController.updateLead(req, res, next)
);

router.patch(
  '/:leadId/status',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => LeadController.updateLeadStatus(req, res, next)
);

router.post(
  '/:leadId/notes',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => LeadController.addLeadNote(req, res, next)
);

router.delete(
  '/:leadId',
  authMiddleware,
  adminMiddleware,
  (req, res, next) => LeadController.deleteLead(req, res, next)
);

export default router;
