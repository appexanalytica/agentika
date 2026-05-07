import { Router } from 'express';
import UserController from '../controllers/UserController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { validateRegister, validateUpdateUser } from '../utils/validation.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/users - admin+ only
router.get('/', authorizeRoles('super_admin', 'admin'), (req, res) => UserController.getAll(req as AuthenticatedRequest, res));

// GET /api/users/:id - any authenticated user can view (self or admin)
router.get('/:id', (req, res) => UserController.getById(req as AuthenticatedRequest, res));

// POST /api/users - super_admin only (create users directly)
router.post('/', authorizeRoles('super_admin'), validateRegister, (req, res) => UserController.create(req as AuthenticatedRequest, res));

// PATCH /api/users/:id - admin can update, super_admin can change roles
router.patch('/:id', authorizeRoles('super_admin', 'admin'), validateUpdateUser, (req, res) => UserController.update(req as AuthenticatedRequest, res));

// DELETE /api/users/:id - super_admin only
router.delete('/:id', authorizeRoles('super_admin'), (req, res) => UserController.delete(req as AuthenticatedRequest, res));

// PATCH /api/users/:id/toggle - super_admin only
router.patch('/:id/toggle', authorizeRoles('super_admin'), (req, res) => UserController.toggleActive(req as AuthenticatedRequest, res));

// PATCH /api/users/:id/password - super_admin only (reset password)
router.patch('/:id/password', authorizeRoles('super_admin'), (req, res) => UserController.updatePassword(req as AuthenticatedRequest, res));

export default router;
