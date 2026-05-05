import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database';
import { initMinIO } from './config/minio';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import fileRoutes from './routes/files';
import blogRoutes from './routes/blog';
import leadRoutes from './routes/leads';
import taskRoutes from './routes/tasks';
import analyticsRoutes from './routes/analytics';
import mailRoutes from './routes/mail';
import userRoutes from './routes/users';

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Health check route (before CORS middleware to allow access)
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running ✅' });
});

// CORS middleware for API routes
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Function to create default superadmin user if it doesn't exist
const createDefaultSuperAdmin = async (): Promise<void> => {
  try {
    const User = (await import('./models/User.js')).default;
    const username = process.env.SEED_ADMIN_USERNAME || 'admin';
    const password = process.env.SEED_ADMIN_PASSWORD;
    const email = process.env.SEED_ADMIN_EMAIL;

    if (!password) {
      console.warn('⚠️  SEED_ADMIN_PASSWORD not set in .env, skipping superadmin creation');
      return;
    }

    const existingAdmin = await User.findOne({ username });

    if (!existingAdmin) {
      const bcryptjs = (await import('bcryptjs')).default;
      const hashedPassword = await bcryptjs.hash(password, 12);

      const admin = new User({
        username,
        email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
        isActive: true,
      });
      await admin.save();
      console.log('✅ Default superadmin user created');
      console.log(`   Username: ${username}`);
      console.log(`   Email: ${email}`);
    } else {
      // Update password if it exists
      const bcryptjs = (await import('bcryptjs')).default;
      const hashedPassword = await bcryptjs.hash(password, 12);
      await User.findByIdAndUpdate(existingAdmin._id, { password: hashedPassword });
      console.log('✅ Superadmin user password updated');
      console.log(`   Username: ${username}`);
    }
  } catch (error) {
    console.error('Error creating default superadmin:', error);
  }
};

// Initialize server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create default superadmin user
    await createDefaultSuperAdmin();

    // Initialize MinIO
    await initMinIO();

    // Start server
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║   Agentika Backend Server Started      ║
║   Port: ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}     ║
╚═══════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
