import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  useSSL: process.env.MINIO_USE_SSL === 'true',
});

const bucketName = process.env.MINIO_BUCKET_NAME || 'agentika';

const initMinIO = async (): Promise<void> => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ MinIO bucket '${bucketName}' created`);
    } else {
      console.log(`✅ MinIO bucket '${bucketName}' already exists`);
    }
  } catch (error) {
    console.error('❌ MinIO initialization failed:', error);
    process.exit(1);
  }
};

export { minioClient, bucketName, initMinIO };
