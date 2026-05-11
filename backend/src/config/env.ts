import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  mongodb: {
    uri: string;
    user?: string;
    password?: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors: {
    origin: string[];
  };
  minio: {
    endpoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucketMedia: string;
    publicUrl: string;
  };
  mail: {
    provider: string;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
    };
    imap: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      pass: string;
    };
  };
  urls: {
    appPublic: string;
    adminPublic: string;
    apiPublic: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  seed: {
    adminEmail: string;
    adminPassword: string;
  };
  upload: {
    maxFileSize: number;
    allowedFileTypes: string[];
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/agentika',
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:8080').split(',').map(o => o.trim()),
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucketMedia: process.env.MINIO_BUCKET_MEDIA || 'agentika-media',
    publicUrl: process.env.MINIO_PUBLIC_URL || 'http://localhost:9000/agentika-media',
  },
  mail: {
    provider: process.env.MAIL_PROVIDER || 'imap_smtp',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    imap: {
      host: process.env.IMAP_HOST || '',
      port: parseInt(process.env.IMAP_PORT || '993', 10),
      secure: process.env.IMAP_SECURE === 'true',
      user: process.env.IMAP_USER || '',
      pass: process.env.IMAP_PASS || '',
    },
  },
  urls: {
    appPublic: process.env.APP_PUBLIC_URL || 'http://localhost:8080',
    adminPublic: process.env.ADMIN_PUBLIC_URL || 'http://localhost:3000',
    apiPublic: process.env.API_PUBLIC_URL || 'http://localhost:5000',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '300', 10),
  },
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@agentika.com',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10),
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,txt,jpg,jpeg,png,gif,webp').split(','),
  },
};

// Validate critical environment variables
if (config.nodeEnv === 'production') {
  if (!config.jwt.secret || config.jwt.secret === 'dev_secret_change_in_production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  if (!config.jwt.refreshSecret || config.jwt.refreshSecret === 'dev_refresh_secret_change_in_production') {
    throw new Error('JWT_REFRESH_SECRET must be set in production');
  }
}

export default config;
