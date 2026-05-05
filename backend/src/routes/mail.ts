import { Router } from 'express';
import { emailController } from '../controllers/EmailController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// All email routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Get emails
router.get('/inbox', emailController.getInbox.bind(emailController));
router.get('/sent', emailController.getSent.bind(emailController));
router.get('/folder/:folder', emailController.getByFolder.bind(emailController));
router.get('/unread-count', emailController.getUnreadCount.bind(emailController));
router.get('/:id', emailController.getById.bind(emailController));

// Send and reply
router.post('/send', emailController.sendEmail.bind(emailController));
router.post('/reply/:id', emailController.replyEmail.bind(emailController));

// Sync
router.post('/sync', emailController.syncEmails.bind(emailController));

// Update email
router.patch('/:id/read', emailController.markAsRead.bind(emailController));
router.patch('/:id/folder', emailController.moveToFolder.bind(emailController));

// Delete
router.delete('/:id', emailController.deleteEmail.bind(emailController));

// Test configuration
router.post('/test', emailController.testConfig.bind(emailController));

export default router;
