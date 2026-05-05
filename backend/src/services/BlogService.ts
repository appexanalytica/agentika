import BlogPost, { IBlogPost } from '../models/BlogPost';
import { minioClient, bucketName } from '../config/minio';
import { v4 as uuidv4 } from 'uuid';

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  thumbnail?: string;
  cover?: string;
  tags?: string[];
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: string;
}

export interface UpdateBlogPostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  cover?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: string;
  publishedAt?: Date;
}

export class BlogService {
  /**
   * Sube una imagen a MinIO y devuelve la URL presignada
   */
  async uploadBlogImage(
    buffer: Buffer,
    originalName: string,
    mimetype: string
  ): Promise<{ fileName: string; presignedUrl: string }> {
    try {
      const fileId = uuidv4();
      const ext = originalName.split('.').pop();
      const fileName = `blog/${fileId}.${ext}`;

      // Upload to MinIO
      await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
        'Content-Type': mimetype,
      });

      // Generate presigned URL (válida por 24 horas)
      const presignedUrl = await minioClient.presignedGetObject(
        bucketName,
        fileName,
        24 * 3600
      );

      return {
        fileName,
        presignedUrl,
      };
    } catch (error) {
      console.error('Blog image upload error:', error);
      throw new Error('Failed to upload blog image');
    }
  }

  /**
   * Genera una URL presignada para una imagen del blog
   */
  async getBlogImagePresignedUrl(
    fileName: string,
    expiresIn: number = 24 * 3600
  ): Promise<string> {
    try {
      return await minioClient.presignedGetObject(bucketName, fileName, expiresIn);
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }
  async createPost(input: CreateBlogPostInput): Promise<IBlogPost> {
    try {
      const post = await BlogPost.create(input);
      return post.populate('author', 'email firstName lastName');
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  async getPostById(postId: string): Promise<IBlogPost | null> {
    return BlogPost.findByIdAndUpdate(postId, { $inc: { views: 1 } }, { new: true }).populate(
      'author',
      'email firstName lastName'
    );
  }

  async getAllPosts(
    page: number = 1,
    limit: number = 10,
    status: string = 'published'
  ): Promise<{ posts: IBlogPost[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'email firstName lastName');

    const total = await BlogPost.countDocuments({ status });
    const pages = Math.ceil(total / limit);

    return { posts, total, pages };
  }

  async updatePost(postId: string, input: UpdateBlogPostInput): Promise<IBlogPost | null> {
    try {
      return BlogPost.findByIdAndUpdate(postId, input, { new: true }).populate(
        'author',
        'email firstName lastName'
      );
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<IBlogPost | null> {
    // First get the post to check for associated files
    const post = await BlogPost.findById(postId);
    if (!post) {
      return null;
    }

    // Delete associated files from MinIO if they exist
    const filesToDelete: string[] = [];
    
    // Add thumbnail if exists
    if (post.thumbnail) {
      filesToDelete.push(post.thumbnail);
    }
    
    // Add cover if exists
    if (post.cover) {
      filesToDelete.push(post.cover);
    }
    
    // Delete files from MinIO
    for (const file of filesToDelete) {
      try {
        // Extract filename from the path (assuming it's stored as blog/{filename})
        const fileName = file.split('/').pop();
        if (fileName) {
          await minioClient.removeObject(bucketName, fileName);
        }
      } catch (error) {
        console.error(`Error deleting file from MinIO: ${file}`, error);
      }
    }

    // Delete the post from MongoDB
    return BlogPost.findByIdAndDelete(postId);
  }

  async likePost(postId: string): Promise<IBlogPost | null> {
    return BlogPost.findByIdAndUpdate(postId, { $inc: { likes: 1 } }, { new: true });
  }

  async searchPosts(query: string, limit: number = 10): Promise<IBlogPost[]> {
    return BlogPost.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [query.toLowerCase()] } },
      ],
      status: 'published',
    })
      .limit(limit)
      .populate('author', 'email firstName lastName');
  }

  async getPostsByTag(tag: string, limit: number = 10): Promise<IBlogPost[]> {
    return BlogPost.find({ tags: tag.toLowerCase(), status: 'published' })
      .limit(limit)
      .populate('author', 'email firstName lastName');
  }
}

export default new BlogService();
