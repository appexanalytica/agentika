import { Router } from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import stubRoutes from './stubs.js';

export const apiRouter = Router();

apiRouter.get('/', (_req, res) => {
  res.json({ message: 'Agentika API' });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/', stubRoutes);
