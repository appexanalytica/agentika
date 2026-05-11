import { Router } from 'express';
import * as userController from '../controllers/UserController.js';
import { authenticate, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import { validateIdParam, validateUpdateUser, validatePagination } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, requireAdmin, validatePagination, userController.getUsers);
router.get('/:id', authenticate, validateIdParam, userController.getUserById);
router.post('/', authenticate, requireSuperAdmin, userController.createUser);
router.patch('/:id', authenticate, validateIdParam, validateUpdateUser, userController.updateUser);
router.delete('/:id', authenticate, requireSuperAdmin, validateIdParam, userController.deleteUser);
router.patch('/:id/toggle', authenticate, requireSuperAdmin, validateIdParam, userController.toggleUserActive);
router.patch('/:id/password', authenticate, requireSuperAdmin, validateIdParam, body('newPassword').notEmpty(), userController.resetUserPassword);

export default router;
