import { Request, Response, NextFunction } from 'express';
import FileService from '../services/FileService';

export class FileController {
  async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const tags = req.body.tags ? req.body.tags.split(',') : [];

      const file = await FileService.uploadFile({
        buffer: req.file.buffer,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
        userId: req.user.id,
        tags,
      });

      res.status(201).json({
        message: 'File uploaded successfully',
        data: file,
      });
    } catch (error) {
      next(error);
    }
  }

  async download(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      const { stream, fileName } = await FileService.downloadFile(fileId);

      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      stream.pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { fileId } = req.params;

      // Check if user owns the file
      const file = await FileService.getFileMetadata(fileId);

      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      if (file.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      await FileService.deleteFile(fileId);

      res.status(200).json({
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;

      const file = await FileService.getFileMetadata(fileId);

      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      res.status(200).json({
        data: file,
      });
    } catch (error) {
      next(error);
    }
  }

  async listUserFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const files = await FileService.listUserFiles(req.user.id);

      res.status(200).json({
        data: files,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fileId } = req.params;
      const { expiresIn } = req.query;

      const url = await FileService.generatePresignedUrl(
        fileId,
        expiresIn ? parseInt(expiresIn as string, 10) : 3600
      );

      res.status(200).json({
        data: { url },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FileController();
