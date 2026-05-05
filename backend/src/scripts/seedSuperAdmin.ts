import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import connectDB from '../config/database.js';
import User from '../models/User.js';

dotenv.config();

async function seedSuperAdmin() {
  try {
    await connectDB();

    const username = process.env.SEED_ADMIN_USERNAME || 'admin';
    const password = process.env.SEED_ADMIN_PASSWORD;
    const email = process.env.SEED_ADMIN_EMAIL;

    if (!password) {
      throw new Error('Falta SEED_ADMIN_PASSWORD en .env');
    }

    const exists = await User.findOne({ username });

    if (exists) {
      console.log('✅ Superadmin inicial ya existe');
      process.exit(0);
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    await User.create({
      username,
      email,
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
      isActive: true,
    });

    console.log('✅ Superadmin inicial creado exitosamente');
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando superadmin:', error);
    process.exit(1);
  }
}

seedSuperAdmin();
