import dotenv from 'dotenv';
import connectDB from './config/database.js';
import initializeMinIO from './config/minio.js';
import User from './models/User.js';
import Pipeline from './models/Pipeline.js';
import PipelineStage from './models/PipelineStage.js';
import Setting from './models/Setting.js';
import BlogCategory from './models/BlogCategory.js';
import { hashPassword } from './utils/password.js';

dotenv.config();

const seed = async () => {
  try {
    console.log('Starting seed...');

    // Connect to database
    await connectDB();
    console.log('MongoDB connected');

    // Initialize MinIO
    await initializeMinIO();
    console.log('MinIO initialized');

    // Clear existing data (optional - comment out if you want to preserve data)
    console.log('Clearing existing data...');
    await User.deleteMany({ role: { $ne: 'super_admin' } });
    await Pipeline.deleteMany({});
    await PipelineStage.deleteMany({});
    await Setting.deleteMany({});
    await BlogCategory.deleteMany({});

    // Seed super admin
    console.log('Seeding super admin...');
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      await User.create({
        username: process.env.SEED_ADMIN_USERNAME || 'admin',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@agentika.com',
        passwordHash: await hashPassword(process.env.SEED_ADMIN_PASSWORD || 'Admin123!'),
        firstName: 'Super',
        lastName: 'Admin',
        role: 'super_admin',
        isActive: true,
      });
      console.log('Super admin created');
    }

    const adminUser = await User.findOne({ role: 'super_admin' });

    // Seed regular users
    console.log('Seeding users...');
    await User.create([
      {
        username: 'john.doe',
        email: 'john@agentika.com',
        passwordHash: await hashPassword('User123!'),
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        isActive: true,
      },
      {
        username: 'jane.smith',
        email: 'jane@agentika.com',
        passwordHash: await hashPassword('User123!'),
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'user',
        isActive: true,
      },
    ]);
    console.log('Users created');

    // Seed settings
    console.log('Seeding settings...');
    await Setting.create([
      { key: 'site_name', value: 'AGENTIKA', group: 'general', isPublic: true },
      { key: 'site_description', value: 'Creating extraordinary digital experiences through thoughtful architecture and design', group: 'general', isPublic: true },
      { key: 'contact_email', value: 'contact@agentika.com', group: 'contact', isPublic: true },
      { key: 'contact_phone', value: '+1 (555) 123-4567', group: 'contact', isPublic: true },
      { key: 'contact_address', value: '123 Innovation Street, Tech City, TC 12345', group: 'contact', isPublic: true },
      { key: 'social_twitter', value: 'https://twitter.com/agentika', group: 'social', isPublic: true },
      { key: 'social_linkedin', value: 'https://linkedin.com/company/agentika', group: 'social', isPublic: true },
      { key: 'social_github', value: 'https://github.com/agentika', group: 'social', isPublic: true },
    ]);
    console.log('Settings created');

    // Seed pipeline
    console.log('Seeding pipeline...');
    const pipeline = await Pipeline.create({
      name: 'Default Sales Pipeline',
      description: 'Standard sales process for tracking leads and deals',
      isDefault: true,
      createdBy: adminUser?._id,
    });

    await PipelineStage.create([
      { pipeline: pipeline._id, name: 'New', order: 1, probability: 10, color: '#3B82F6', isWon: false, isLost: false },
      { pipeline: pipeline._id, name: 'Contacted', order: 2, probability: 20, color: '#60A5FA', isWon: false, isLost: false },
      { pipeline: pipeline._id, name: 'Qualified', order: 3, probability: 40, color: '#10B981', isWon: false, isLost: false },
      { pipeline: pipeline._id, name: 'Proposal Sent', order: 4, probability: 60, color: '#F59E0B', isWon: false, isLost: false },
      { pipeline: pipeline._id, name: 'Negotiation', order: 5, probability: 80, color: '#EF4444', isWon: false, isLost: false },
      { pipeline: pipeline._id, name: 'Won', order: 6, probability: 100, color: '#22C55E', isWon: true, isLost: false },
      { pipeline: pipeline._id, name: 'Lost', order: 7, probability: 0, color: '#6B7280', isWon: false, isLost: true },
    ]);
    console.log('Pipeline created');

    // Seed blog categories
    console.log('Seeding blog categories...');
    await BlogCategory.create([
      { name: 'Technology', slug: 'technology', description: 'Articles about technology and development', color: '#3B82F6' },
      { name: 'Design', slug: 'design', description: 'UI/UX and design articles', color: '#EC4899' },
      { name: 'Business', slug: 'business', description: 'Business insights and strategy', color: '#10B981' },
      { name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides', color: '#F59E0B' },
    ]);
    console.log('Blog categories created');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
