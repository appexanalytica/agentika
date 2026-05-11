import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/database.js';
import initializeMinIO from './config/minio.js';
import config from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import User from './models/User.js';
import { hashPassword } from './utils/password.js';
import Setting from './models/Setting.js';
import Pipeline from './models/Pipeline.js';
import PipelineStage from './models/PipelineStage.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiRateLimit);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Seed super admin
const seedSuperAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ username: config.seed.adminUsername });
    if (!existingAdmin) {
      await User.create({
        username: config.seed.adminUsername,
        email: config.seed.adminEmail,
        passwordHash: await hashPassword(config.seed.adminPassword),
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isActive: true,
      });
      console.log('Super admin user created');
    }
  } catch (err) {
    console.error('Error seeding super admin:', err);
  }
};

// Seed initial data
const seedInitialData = async () => {
  try {
    // Seed settings
    const existingSettings = await Setting.countDocuments();
    if (existingSettings === 0) {
      await Setting.create([
        { key: 'site_name', value: 'AGENTIKA', group: 'general', isPublic: true },
        { key: 'site_description', value: 'Creating extraordinary digital experiences', group: 'general', isPublic: true },
        { key: 'contact_email', value: 'contact@agentika.com', group: 'contact', isPublic: true },
        { key: 'contact_phone', value: '+1 (555) 123-4567', group: 'contact', isPublic: true },
      ]);
      console.log('Initial settings created');
    }

    // Seed default pipeline
    const existingPipeline = await Pipeline.findOne({ isDefault: true });
    if (!existingPipeline) {
      const admin = await User.findOne({ role: 'super_admin' });
      const pipeline = await Pipeline.create({
        name: 'Default Sales Pipeline',
        description: 'Standard sales process',
        isDefault: true,
        createdBy: admin?._id,
      });

      await PipelineStage.create([
        { pipeline: pipeline._id, name: 'New', order: 1, probability: 10, color: '#3B82F6', isWon: false, isLost: false },
        { pipeline: pipeline._id, name: 'Qualified', order: 2, probability: 25, color: '#10B981', isWon: false, isLost: false },
        { pipeline: pipeline._id, name: 'Proposal', order: 3, probability: 50, color: '#F59E0B', isWon: false, isLost: false },
        { pipeline: pipeline._id, name: 'Negotiation', order: 4, probability: 75, color: '#EF4444', isWon: false, isLost: false },
        { pipeline: pipeline._id, name: 'Won', order: 5, probability: 100, color: '#22C55E', isWon: true, isLost: false },
        { pipeline: pipeline._id, name: 'Lost', order: 6, probability: 0, color: '#6B7280', isWon: false, isLost: true },
      ]);
      console.log('Default pipeline created');
    }
  } catch (err) {
    console.error('Error seeding initial data:', err);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('MongoDB connected');

    // Initialize MinIO
    await initializeMinIO();
    console.log('MinIO initialized');

    // Seed data
    await seedSuperAdmin();
    await seedInitialData();

    // Start listening
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export default app;
