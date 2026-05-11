import { Router } from 'express';
import * as blogController from '../controllers/BlogController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { validateIdParam, validateBlogPost, validatePagination } from '../utils/validation.js';

const router = Router();

// Public routes (no auth required for published posts)
router.get('/', validatePagination, blogController.getBlogPosts);
router.get('/slug/:slug', blogController.getBlogPostBySlug);
router.get('/categories', blogController.getBlogCategories);

// Admin routes (auth required)
router.post('/', authenticate, requireAdmin, validateBlogPost, blogController.createBlogPost);
router.get('/:id', authenticate, validateIdParam, blogController.getBlogPosts); // Reuse getBlogPosts for admin
router.patch('/:id', authenticate, requireAdmin, validateIdParam, validateBlogPost, blogController.updateBlogPost);
router.delete('/:id', authenticate, requireSuperAdmin, validateIdParam, blogController.deleteBlogPost);
router.patch('/:id/publish', authenticate, requireAdmin, validateIdParam, blogController.publishBlogPost);
router.patch('/:id/archive', authenticate, requireAdmin, validateIdParam, blogController.archiveBlogPost);
router.post('/:id/duplicate', authenticate, requireAdmin, validateIdParam, blogController.duplicateBlogPost);

// Category routes
router.post('/categories', authenticate, requireAdmin, body('name').notEmpty(), blogController.createBlogCategory);
router.patch('/categories/:id', authenticate, requireAdmin, validateIdParam, body('name').optional(), blogController.updateBlogCategory);
router.delete('/categories/:id', authenticate, requireSuperAdmin, validateIdParam, blogController.deleteBlogCategory);

export default router;
