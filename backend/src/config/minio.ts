import * as Minio from 'minio';
import config from './env.js';

const minioClient = new Minio.Client({
  endPoint: config.minio.endpoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

export const ensureBucketExists = async (bucketName: string): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} created successfully`);
      
      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
          },
        ],
      };
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      console.log(`Bucket ${bucketName} policy set to public read`);
    }
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
    throw error;
  }
};

export const initializeBuckets = async (): Promise<void> => {
  try {
    await ensureBucketExists(config.minio.bucketMedia);
    console.log('MinIO buckets initialized successfully');
  } catch (error) {
    console.error('Error initializing MinIO buckets:', error);
    throw error;
  }
};

export default minioClient;
