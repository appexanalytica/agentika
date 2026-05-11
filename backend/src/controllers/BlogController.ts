import { Response } from 'express';
import BlogPost from '../models/BlogPost.js';
import BlogCategory from '../models/BlogCategory.js';
import MediaAsset from '../models/MediaAsset.js';
import { getPaginationParams, buildFilterQuery, generateSlug, calculateReadTime } from '../utils/helpers.js';
import type { AuthenticatedRequest, PaginatedResponse, SuccessResponse, ErrorResponse } from '../types/index.js';

export const getBlogPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);
    
    const filter = isAdmin ? buildFilterQuery(req.query, BlogPost.schema) : { status: 'published' };

    const posts = await BlogPost.find(filter)
      .populate('author', 'username firstName lastName')
      .populate('category', 'name slug')
      .populate('featuredImage', 'filename publicUrl')
      .populate('ogImage', 'filename publicUrl')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(filter);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    } as PaginatedResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog posts',
    } as ErrorResponse);
  }
};

export const getBlogPostBySlug = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const isAdmin = req.user && ['admin', 'super_admin'].includes(req.user.role);

    const filter = isAdmin ? { slug } : { slug, status: 'published' };

    const post = await BlogPost.findOne(filter)
      .populate('author', 'username firstName lastName')
      .populate('category', 'name slug')
      .populate('featuredImage', 'filename publicUrl')
      .populate('ogImage', 'filename publicUrl');

    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found',
      } as ErrorResponse);
      return;
    }

    // Increment views for public access
    if (!isAdmin) {
      post.views = (post.views || 0) + 1;
      await post.save();
    }

    res.json({
      success: true,
      data: post,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog post',
    } as ErrorResponse);
  }
};

export const createBlogPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category, tags, status, featuredImage, ogImage, seoTitle, seoDescription, ogTitle, ogDescription, canonicalUrl, scheduledAt } = req.body;

    const slug = generateSlug(title);

    const existing = await BlogPost.findOne({ slug });
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'A post with this slug already exists',
      } as ErrorResponse);
      return;
    }

    const readTime = calculateReadTime(content);

    const post = await BlogPost.create({
      title,
      slug,
      excerpt: req.body.excerpt || content.substring(0, 200),
      content,
      contentFormat: req.body.contentFormat || 'markdown',
      author: req.user!._id,
      category,
      tags: tags || [],
      status: status || 'draft',
      featuredImage,
      ogImage,
      seoTitle,
      seoDescription,
      ogTitle,
      ogDescription,
      canonicalUrl,
      scheduledAt,
      readTime,
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    res.status(201).json({
      success: true,
      data: post,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating blog post',
    } as ErrorResponse);
  }
};

export const updateBlogPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found',
      } as ErrorResponse);
      return;
    }

    const { title, content, status } = req.body;

    if (title && title !== post.title) {
      post.slug = generateSlug(title);
    }

    if (content) {
      post.readTime = calculateReadTime(content);
    }

    if (status === 'published' && post.status !== 'published') {
      post.publishedAt = new Date();
    }

    Object.assign(post, req.body);
    await post.save();

    res.json({
      success: true,
      data: post,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating blog post',
    } as ErrorResponse);
  }
};

export const deleteBlogPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found',
      } as ErrorResponse);
      return;
    }

    await BlogPost.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blog post deleted successfully',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog post',
    } as ErrorResponse);
  }
};

export const publishBlogPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found',
      } as ErrorResponse);
      return;
    }

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    res.json({
      success: true,
      data: post,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error publishing blog post',
    } as ErrorResponse);
  }
};

export const archiveBlogPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found',
      } as ErrorResponse);
      return;
    }

    post.status = 'archived';
    await post.save();

    res.json({
      success: true,
      data: post,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error archiving blog post',
    } as ErrorResponse);
  }
};

export const duplicateBlogPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const original = await BlogPost.findById(req.params.id);
    if (!original) {
      res.status(404).json({
        success: false,
        message: 'Blog post not found',
      } as ErrorResponse);
      return;
    }

    const newSlug = `${original.slug}-copy-${Date.now()}`;

    const duplicate = await BlogPost.create({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (Copy)`,
      slug: newSlug,
      status: 'draft',
      publishedAt: undefined,
      views: 0,
      author: req.user!._id,
    });

    res.status(201).json({
      success: true,
      data: duplicate,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error duplicating blog post',
    } as ErrorResponse);
  }
};

// Blog Categories
export const getBlogCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await BlogCategory.find({ isActive: true }).sort({ name: 1 });

    res.json({
      success: true,
      data: categories,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blog categories',
    } as ErrorResponse);
  }
};

export const createBlogCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color } = req.body;

    const slug = generateSlug(name);

    const existing = await BlogCategory.findOne({ slug });
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Category with this slug already exists',
      } as ErrorResponse);
      return;
    }

    const category = await BlogCategory.create({
      name,
      slug,
      description,
      color: color || '#3B82F6',
    });

    res.status(201).json({
      success: true,
      data: category,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error creating blog category',
    } as ErrorResponse);
  }
};

export const updateBlogCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await BlogCategory.findById(req.params.id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Blog category not found',
      } as ErrorResponse);
      return;
    }

    if (req.body.name) {
      category.slug = generateSlug(req.body.name);
    }

    Object.assign(category, req.body);
    await category.save();

    res.json({
      success: true,
      data: category,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error updating blog category',
    } as ErrorResponse);
  }
};

export const deleteBlogCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await BlogCategory.findById(req.params.id);
    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Blog category not found',
      } as ErrorResponse);
      return;
    }

    await BlogCategory.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Blog category deleted successfully',
    } as SuccessResponse<null>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting blog category',
    } as ErrorResponse);
  }
};
