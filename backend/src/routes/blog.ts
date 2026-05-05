import { Router } from 'express';
import multer from 'multer';
import BlogController, {
  createPostValidationRules,
  updatePostValidationRules,
} from '../controllers/BlogController';
import { validationErrorHandler } from '../middleware/errorHandler';
import { authMiddleware, optionalAuthMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Public routes
router.get('/', optionalAuthMiddleware, (req, res, next) => BlogController.getAllPosts(req, res, next));

router.get('/post/:postId', optionalAuthMiddleware, (req, res, next) =>
  BlogController.getPost(req, res, next)
);

router.get('/search', (req, res, next) => BlogController.searchPosts(req, res, next));

router.get('/tag/:tag', (req, res, next) => BlogController.getPostsByTag(req, res, next));

// Protected routes (require authentication)
router.post('/:postId/like', authMiddleware, (req, res, next) =>
  BlogController.likePost(req, res, next)
);

// Image upload route MUST come before /:postId routes to avoid route matching issues
router.post('/upload-image', authMiddleware, upload.single('image'), (req, res, next) =>
  BlogController.uploadBlogImage(req, res, next)
);

router.post(
  '/',
  authMiddleware,
  createPostValidationRules(),
  validationErrorHandler,
  (req, res, next) => BlogController.createPost(req, res, next)
);

router.put(
  '/:postId',
  authMiddleware,
  updatePostValidationRules(),
  validationErrorHandler,
  (req, res, next) => BlogController.updatePost(req, res, next)
);

router.delete('/:postId', authMiddleware, (req, res, next) =>
  BlogController.deletePost(req, res, next)
);

export default router;
