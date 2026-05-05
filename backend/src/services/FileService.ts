import { v4 as uuidv4 } from 'uuid';
import { minioClient, bucketName } from '../config/minio';
import FileModel, { IFile } from '../models/File';
import { Readable } from 'stream';

export interface FileUploadInput {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  userId: string;
  tags?: string[];
}

export class FileService {
  async uploadFile(input: FileUploadInput): Promise<IFile> {
    try {
      // Generate unique filename
      const fileId = uuidv4();
      const ext = input.originalname.split('.').pop();
      const fileName = `${fileId}.${ext}`;

      // Upload to MinIO
      await minioClient.putObject(bucketName, fileName, input.buffer, input.buffer.length, {
        'Content-Type': input.mimetype,
      });

      // Save metadata to MongoDB
      const file = await FileModel.create({
        fileName,
        originalName: input.originalname,
        size: input.buffer.length,
        mimeType: input.mimetype,
        uploadedBy: input.userId,
        minioPath: `${bucketName}/${fileName}`,
        tags: input.tags || [],
      });

      return file;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  async downloadFile(fileId: string): Promise<{ stream: Readable; fileName: string }> {
    try {
      const file = await FileModel.findById(fileId);

      if (!file) {
        throw new Error('File not found');
      }

      const stream = await minioClient.getObject(bucketName, file.fileName);

      return {
        stream,
        fileName: file.originalName,
      };
    } catch (error) {
      console.error('File download error:', error);
      throw new Error('Failed to download file');
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const file = await FileModel.findByIdAndDelete(fileId);

      if (!file) {
        throw new Error('File not found');
      }

      await minioClient.removeObject(bucketName, file.fileName);
    } catch (error) {
      console.error('File delete error:', error);
      throw new Error('Failed to delete file');
    }
  }

  async getFileMetadata(fileId: string): Promise<IFile | null> {
    return FileModel.findById(fileId).populate('uploadedBy', 'email firstName lastName');
  }

  async listUserFiles(userId: string): Promise<IFile[]> {
    return FileModel.find({ uploadedBy: userId }).sort({ createdAt: -1 });
  }

  async generatePresignedUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    try {
      const file = await FileModel.findById(fileId);

      if (!file) {
        throw new Error('File not found');
      }

      const url = await minioClient.presignedGetObject(
        bucketName,
        file.fileName,
        expiresIn
      );

      return url;
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }
}

export default new FileService();
