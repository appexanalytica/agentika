import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';
import connectDB from './config/database.js';
import User from './models/User.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.CORS_ORIGIN,
      'http://localhost:8080',
      'http://localhost:8081',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:8081',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

const seedSuperAdmin = async () => {
  try {
    const username = process.env.SEED_ADMIN_USERNAME || 'admin';
    const password = process.env.SEED_ADMIN_PASSWORD;
    const email = process.env.SEED_ADMIN_EMAIL || 'admin@agentika.com';

    if (!password) {
      console.warn('SEED_ADMIN_PASSWORD not set, skipping super admin seed');
      return;
    }

    const existing = await User.findOne({ username });
    if (existing) {
      if (existing.role !== 'super_admin') {
        existing.role = 'super_admin';
        await existing.save();
        console.log('Existing admin promoted to super_admin');
      } else {
        console.log('Super admin already exists');
      }
      return;
    }

    await User.create({
      username,
      email,
      passwordHash: password,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
    });

    console.log(`Super admin "${username}" created successfully`);
  } catch (err) {
    console.error('Failed to seed super admin:', err);
  }
};

const start = async () => {
  try {
    await connectDB();
    await seedSuperAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
