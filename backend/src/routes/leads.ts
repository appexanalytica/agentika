import { Router } from 'express';
import * as leadController from '../controllers/LeadController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateIdParam, validateLead, validatePagination } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, validatePagination, leadController.getLeads);
router.get('/:id', authenticate, validateIdParam, leadController.getLeadById);
router.post('/', authenticate, validateLead, leadController.createLead);
router.patch('/:id', authenticate, validateIdParam, leadController.updateLead);
router.delete('/:id', authenticate, requireAdmin, validateIdParam, leadController.deleteLead);
router.patch('/:id/status', authenticate, validateIdParam, body('status').notEmpty(), leadController.updateLeadStatus);
router.patch('/:id/assign', authenticate, validateIdParam, body('assignedTo').isMongoId(), leadController.assignLead);
router.post('/:id/notes', authenticate, validateIdParam, body('note').notEmpty(), leadController.addLeadNote);
router.get('/:id/activity', authenticate, validateIdParam, leadController.getLeadActivity);

export default router;
