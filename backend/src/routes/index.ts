import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import leadRoutes from './leads.js';
import blogRoutes from './blog.js';
import mediaRoutes from './media.js';
import publicRoutes from './public.js';
import analyticsRoutes from './analytics.js';
import ogRoutes from './og.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/leads', leadRoutes);
router.use('/blog', blogRoutes);
router.use('/media', mediaRoutes);
router.use('/public', publicRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/og', ogRoutes);

export default router;
