import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';
import { loginRateLimit } from '../middleware/rateLimit.js';
import { validateRegister, validateLogin } from '../utils/validation.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

router.post('/register', validateRegister, AuthController.register);
router.post('/login', loginRateLimit, validateLogin, AuthController.login);
router.post('/admin/login', loginRateLimit, validateLogin, AuthController.adminLogin);
router.post('/refresh', AuthController.refresh);
router.get('/me', authenticate, (req, res) => AuthController.me(req as AuthenticatedRequest, res));
router.post('/change-password', authenticate, (req, res) => AuthController.changePassword(req as AuthenticatedRequest, res));

export default router;
