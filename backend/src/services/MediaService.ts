import minioClient from '../config/minio.js';
import MediaAsset from '../models/MediaAsset.js';
import config from '../config/env.js';
import { v4 as uuidv4 } from 'uuid';
import type { Types } from 'mongoose';

export interface UploadResult {
  filename: string;
  objectKey: string;
  publicUrl: string;
  size: number;
  mimeType: string;
}

export const uploadFile = async (
  file: Buffer,
  originalName: string,
  mimeType: string,
  uploadedBy: Types.ObjectId,
  usageType: 'blog' | 'avatar' | 'og' | 'attachment' | 'general' = 'general',
  relatedToType?: string,
  relatedToId?: Types.ObjectId
): Promise<MediaAsset> => {
  // Validate file size
  if (file.length > config.upload.maxFileSize) {
    throw new Error(`File size exceeds maximum of ${config.upload.maxFileSize} bytes`);
  }

  // Validate mime type
  const ext = originalName.split('.').pop()?.toLowerCase();
  if (!config.upload.allowedFileTypes.includes(ext || '')) {
    throw new Error(`File type not allowed. Allowed types: ${config.upload.allowedFileTypes.join(', ')}`);
  }

  // Generate secure filename
  const filename = `${uuidv4()}-${originalName}`;
  const objectKey = `${usageType}/${filename}`;

  // Upload to MinIO
  await minioClient.putObject(config.minio.bucketMedia, objectKey, file, file.length, {
    'Content-Type': mimeType,
  });

  // Generate public URL
  const publicUrl = `${config.minio.publicUrl}/${objectKey}`;

  // Save metadata to MongoDB
  const mediaAsset = await MediaAsset.create({
    filename,
    originalName,
    mimeType,
    size: file.length,
    bucket: config.minio.bucketMedia,
    objectKey,
    publicUrl,
    uploadedBy,
    usageType,
    relatedToType,
    relatedToId,
  });

  return mediaAsset;
};

export const deleteFile = async (id: Types.ObjectId, userId: Types.ObjectId): Promise<void> => {
  const mediaAsset = await MediaAsset.findById(id);
  if (!mediaAsset) {
    throw new Error('Media asset not found');
  }

  // Delete from MinIO
  await minioClient.removeObject(mediaAsset.bucket, mediaAsset.objectKey);

  // Delete from MongoDB
  await MediaAsset.findByIdAndDelete(id);
};

export const getFileUrl = async (id: Types.ObjectId): Promise<string> => {
  const mediaAsset = await MediaAsset.findById(id);
  if (!mediaAsset) {
    throw new Error('Media asset not found');
  }

  return mediaAsset.publicUrl;
};

export const getPresignedUrl = async (id: Types.ObjectId, expiry: number = 3600): Promise<string> => {
  const mediaAsset = await MediaAsset.findById(id);
  if (!mediaAsset) {
    throw new Error('Media asset not found');
  }

  return minioClient.presignedGetObject(mediaAsset.bucket, mediaAsset.objectKey, expiry);
};

export default {
  uploadFile,
  deleteFile,
  getFileUrl,
  getPresignedUrl,
};
