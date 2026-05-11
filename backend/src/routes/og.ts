import { Router } from 'express';
import BlogPost from '../models/BlogPost.js';
import Setting from '../models/Setting.js';
import type { Request, Response } from 'express';

const router = Router();

// Generate HTML with dynamic Open Graph tags for crawlers
const generateOgHtml = (meta: {
  title: string;
  description: string;
  image?: string;
  url?: string;
}): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  <meta name="description" content="${meta.description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${meta.title}">
  <meta property="og:description" content="${meta.description}">
  ${meta.image ? `<meta property="og:image" content="${meta.image}">` : ''}
  ${meta.url ? `<meta property="og:url" content="${meta.url}">` : ''}
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">
  ${meta.image ? `<meta name="twitter:image" content="${meta.image}">` : ''}
  
  <!-- Canonical -->
  ${meta.url ? `<link rel="canonical" href="${meta.url}">` : ''}
  
  <!-- Redirect to actual app -->
  <script>
    window.location.href = "${meta.url || '/'}";
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>`;
};

// Default OG tags
router.get('/', async (req: Request, res: Response) => {
  try {
    const settings = await Setting.findOne({ key: 'site_name' });
    const siteName = settings?.value || 'AGENTIKA';
    const siteDescription = 'Creating extraordinary digital experiences through thoughtful architecture and design.';
    
    const html = generateOgHtml({
      title: `${siteName} - Software Factory`,
      description: siteDescription,
      url: `${process.env.APP_PUBLIC_URL || 'http://localhost:8080'}/`,
    });
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    const html = generateOgHtml({
      title: 'AGENTIKA - Software Factory',
      description: 'Creating extraordinary digital experiences.',
    });
    res.set('Content-Type', 'text/html');
    res.send(html);
  }
});

// Blog post OG tags
router.get('/blog/:slug', async (req: Request, res: Response) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: 'published' })
      .populate('featuredImage', 'publicUrl')
      .populate('ogImage', 'publicUrl');
    
    if (!post) {
      const html = generateOgHtml({
        title: 'Post not found - AGENTIKA',
        description: 'The requested blog post was not found.',
      });
      res.set('Content-Type', 'text/html');
      res.send(html);
      return;
    }
    
    const ogImage = post.ogImage?.publicUrl || post.featuredImage?.publicUrl;
    const title = post.ogTitle || post.seoTitle || post.title;
    const description = post.ogDescription || post.seoDescription || post.excerpt;
    
    const html = generateOgHtml({
      title: `${title} | AGENTIKA Blog`,
      description: description || '',
      image: ogImage,
      url: `${process.env.APP_PUBLIC_URL || 'http://localhost:8080'}/blog/${post.slug}`,
    });
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    const html = generateOgHtml({
      title: 'AGENTIKA - Software Factory',
      description: 'Creating extraordinary digital experiences.',
    });
    res.set('Content-Type', 'text/html');
    res.send(html);
  }
});

// Work/Portfolio OG tags
router.get('/work/:slug', async (req: Request, res: Response) => {
  try {
    // In production, you might have a Project model for portfolio items
    // For now, return default OG tags
    const html = generateOgHtml({
      title: 'Our Work | AGENTIKA',
      description: 'Explore our portfolio of digital experiences.',
      url: `${process.env.APP_PUBLIC_URL || 'http://localhost:8080'}/work/${req.params.slug}`,
    });
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    const html = generateOgHtml({
      title: 'AGENTIKA - Software Factory',
      description: 'Creating extraordinary digital experiences.',
    });
    res.set('Content-Type', 'text/html');
    res.send(html);
  }
});

// Page OG tags (generic)
router.get('/page/:page', async (req: Request, res: Response) => {
  try {
    const page = req.params.page;
    const pageTitle = page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' ');
    
    const html = generateOgHtml({
      title: `${pageTitle} | AGENTIKA`,
      description: `Learn more about ${pageTitle} at AGENTIKA.`,
      url: `${process.env.APP_PUBLIC_URL || 'http://localhost:8080'}/${page}`,
    });
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    const html = generateOgHtml({
      title: 'AGENTIKA - Software Factory',
      description: 'Creating extraordinary digital experiences.',
    });
    res.set('Content-Type', 'text/html');
    res.send(html);
  }
});

export default router;
