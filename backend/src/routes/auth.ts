import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/AuthController.js';
import { loginRateLimit } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../utils/validation.js';

const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', loginRateLimit, validateLogin, authController.login);
router.post('/admin/login', loginRateLimit, validateLogin, authController.adminLogin);
router.post('/refresh', authController.refreshToken);
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, body('currentPassword').notEmpty(), body('newPassword').notEmpty(), authController.changePassword);

export default router;
