import { Router } from 'express';
import multer from 'multer';
import * as mediaController from '../controllers/MediaController.js';
import { authenticate } from '../middleware/auth.js';
import { validateIdParam } from '../utils/validation.js';
import config from '../config/env.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (config.upload.allowedFileTypes.includes(ext || '')) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed types: ${config.upload.allowedFileTypes.join(', ')}`));
    }
  },
});

const router = Router();

router.get('/', authenticate, mediaController.getMediaAssets);
router.get('/my-files', authenticate, mediaController.getMyFiles);
router.get('/:id', authenticate, validateIdParam, mediaController.getMediaById);
router.post('/upload', authenticate, upload.single('file'), mediaController.uploadMedia);
router.delete('/:id', authenticate, validateIdParam, mediaController.deleteMedia);
router.get('/:id/presigned-url', authenticate, validateIdParam, mediaController.getPresignedUrl);

export default router;
