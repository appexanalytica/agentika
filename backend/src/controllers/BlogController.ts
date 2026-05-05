import { Request, Response, NextFunction } from 'express';
import BlogService from '../services/BlogService';
import { body, query } from 'express-validator';

export const createPostValidationRules = () => [
  body('title').notEmpty().trim(),
  body('slug').notEmpty().trim().toLowerCase(),
  body('content').notEmpty(),
  body('excerpt').notEmpty().trim().isLength({ max: 500 }),
  body('category').optional().trim(),
  body('tags').optional(),
  body('seoTitle').optional().trim().isLength({ max: 70 }),
  body('seoDescription').optional().trim().isLength({ max: 160 }),
];

export const updatePostValidationRules = () => [
  body('title').optional().trim(),
  body('content').optional(),
  body('excerpt').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['draft', 'published', 'archived']),
  body('category').optional().trim(),
  body('tags').optional(),
  body('seoTitle').optional().trim().isLength({ max: 70 }),
  body('seoDescription').optional().trim().isLength({ max: 160 }),
  body('readTime').optional().trim(),
  body('cover').optional().trim(),
  body('thumbnail').optional().trim(),
];

export class BlogController {
  async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { 
        title, 
        slug, 
        content, 
        excerpt, 
        thumbnail, 
        cover,
        tags,
        category,
        seoTitle,
        seoDescription,
        readTime
      } = req.body;

      const post = await BlogService.createPost({
        title,
        slug,
        content,
        excerpt,
        author: req.user.id,
        thumbnail,
        cover,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [],
        category,
        seoTitle,
        seoDescription,
        readTime: readTime || '5 min read',
      });

      res.status(201).json({
        message: 'Post created successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;

      const post = await BlogService.getPostById(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.status(200).json({
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = (req.query.status as string) || 'published';

      const result = await BlogService.getAllPosts(page, limit, status);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { postId } = req.params;

      // Check if user is author or admin
      const post = await BlogService.getPostById(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      if ((post.author as any).toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      const updateData = req.body;
      if (updateData.tags) {
        updateData.tags = Array.isArray(updateData.tags) 
          ? updateData.tags 
          : updateData.tags.split(',').map((t: string) => t.trim());
      }

      const updatedPost = await BlogService.updatePost(postId, updateData);

      res.status(200).json({
        message: 'Post updated successfully',
        data: updatedPost,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { postId } = req.params;

      const post = await BlogService.getPostById(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      if ((post.author as any).toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }

      await BlogService.deletePost(postId);

      res.status(200).json({
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async likePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;

      const post = await BlogService.likePost(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      res.status(200).json({
        message: 'Post liked successfully',
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query } = req.query;

      if (!query) {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
      }

      const posts = await BlogService.searchPosts(query as string);

      res.status(200).json({
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPostsByTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tag } = req.params;

      const posts = await BlogService.getPostsByTag(tag);

      res.status(200).json({
        data: posts,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadBlogImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file provided' });
        return;
      }

      const { fileName, presignedUrl } = await BlogService.uploadBlogImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      res.status(201).json({
        message: 'Blog image uploaded successfully',
        data: {
          fileName,
          presignedUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BlogController();
