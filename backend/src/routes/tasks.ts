import { Router } from 'express';
import TaskController, {
  createTaskValidationRules,
} from '../controllers/TaskController';
import { validationErrorHandler } from '../middleware/errorHandler';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// Public route - create task (optional auth)
router.post(
  '/',
  optionalAuthMiddleware,
  createTaskValidationRules(),
  validationErrorHandler,
  (req, res, next) => TaskController.createTask(req, res, next)
);

// Protected routes (require authentication)
router.get(
  '/',
  authMiddleware,
  (req, res, next) => TaskController.getAllTasks(req, res, next)
);

router.get(
  '/:taskId',
  authMiddleware,
  (req, res, next) => TaskController.getTask(req, res, next)
);

router.put(
  '/:taskId',
  authMiddleware,
  (req, res, next) => TaskController.updateTask(req, res, next)
);

router.patch(
  '/:taskId/toggle',
  authMiddleware,
  (req, res, next) => TaskController.toggleTaskStatus(req, res, next)
);

router.delete(
  '/:taskId',
  authMiddleware,
  (req, res, next) => TaskController.deleteTask(req, res, next)
);

export default router;
