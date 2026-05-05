import { Router } from 'express';
import multer from 'multer';
import FileController from '../controllers/FileController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All file routes require authentication
router.use(authMiddleware);

router.post('/upload', upload.single('file'), (req, res, next) =>
  FileController.upload(req, res, next)
);

router.get('/download/:fileId', (req, res, next) => FileController.download(req, res, next));

router.delete('/:fileId', (req, res, next) => FileController.delete(req, res, next));

router.get('/metadata/:fileId', (req, res, next) => FileController.getMetadata(req, res, next));

router.get('/my-files', (req, res, next) => FileController.listUserFiles(req, res, next));

router.get('/presigned-url/:fileId', (req, res, next) =>
  FileController.getPresignedUrl(req, res, next)
);

export default router;
