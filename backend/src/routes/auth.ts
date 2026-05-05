import { Router } from 'express';
import AuthController, {
  authValidationRules,
  loginValidationRules,
} from '../controllers/AuthController';
import { validationErrorHandler } from '../middleware/errorHandler';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post(
  '/register',
  authValidationRules(),
  validationErrorHandler,
  (req, res, next) => AuthController.register(req, res, next)
);

router.post(
  '/login',
  loginValidationRules(),
  validationErrorHandler,
  (req, res, next) => AuthController.login(req, res, next)
);

// Admin-only login endpoint
router.post(
  '/admin/login',
  loginValidationRules(),
  validationErrorHandler,
  (req, res, next) => AuthController.adminLogin(req, res, next)
);

// Protected routes
router.get('/me', authMiddleware, (req, res, next) =>
  AuthController.getMe(req, res, next)
);

router.get('/profile', authMiddleware, (req, res, next) =>
  AuthController.getProfile(req, res, next)
);

router.put('/profile', authMiddleware, (req, res, next) =>
  AuthController.updateProfile(req, res, next)
);

// Admin-only routes
router.get('/admin/me', authMiddleware, adminMiddleware, (req, res, next) =>
  AuthController.getProfile(req, res, next)
);

export default router;
