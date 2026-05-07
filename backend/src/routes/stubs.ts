import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All stub routes require auth
router.use(authenticate as any);

// Leads stubs
router.get('/leads', (_req, res) => res.json({ success: true, data: { leads: [] } }));
router.get('/leads/:id', (_req, res) => res.status(404).json({ success: false, message: 'Not implemented' }));
router.put('/leads/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.patch('/leads/:id/status', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.post('/leads/:id/notes', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.delete('/leads/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));

// Blog stubs
router.get('/blog', (_req, res) => res.json({ success: true, data: { posts: [] } }));
router.get('/blog/post/:id', (_req, res) => res.status(404).json({ success: false, message: 'Not implemented' }));
router.post('/blog', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.put('/blog/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.delete('/blog/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));

// Tasks stubs
router.get('/tasks', (_req, res) => res.json({ success: true, data: { tasks: [] } }));
router.get('/tasks/:id', (_req, res) => res.status(404).json({ success: false, message: 'Not implemented' }));
router.post('/tasks', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.put('/tasks/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.patch('/tasks/:id/toggle', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.delete('/tasks/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));

// Mail stubs
router.get('/mail/inbox', (_req, res) => res.json({ success: true, data: { emails: [] } }));
router.get('/mail/sent', (_req, res) => res.json({ success: true, data: { emails: [] } }));
router.get('/mail/folder/:folder', (_req, res) => res.json({ success: true, data: { emails: [] } }));
router.get('/mail/:id', (_req, res) => res.status(404).json({ success: false, message: 'Not implemented' }));
router.get('/mail/unread-count', (_req, res) => res.json({ success: true, data: { count: 0 } }));
router.post('/mail/send', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.post('/mail/reply/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.post('/mail/sync', (_req, res) => res.json({ success: true, data: { synced: 0 } }));
router.patch('/mail/:id/read', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.patch('/mail/:id/folder', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.delete('/mail/:id', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));
router.post('/mail/test', (_req, res) => res.status(501).json({ success: false, message: 'Not implemented' }));

// Analytics stubs
router.get('/analytics/visits', (_req, res) => res.json({ success: true, data: { visits: [] } }));
router.get('/analytics/total', (_req, res) => res.json({ success: true, data: { total: 0 } }));
router.get('/analytics/dashboard', (_req, res) => res.json({
  success: true,
  data: {
    visits: [],
    sources: [],
    topPosts: [],
    recentLeads: [],
    pipelineValue: 0,
  }
}));
router.get('/analytics/leads-by-status', (_req, res) => res.json({ success: true, data: { statuses: [] } }));
router.get('/analytics/pipeline-value', (_req, res) => res.json({ success: true, data: { value: 0 } }));
router.get('/analytics/top-blog-posts', (_req, res) => res.json({ success: true, data: { posts: [] } }));
router.get('/analytics/referrers', (_req, res) => res.json({ success: true, data: { referrers: [] } }));

export default router;
