import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navigation from "@/components/Navigation";
import { useBlog, type BlogPost } from "@/hooks/useAPI";

const BlogPostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getPost } = useBlog();

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPost(postId);
      setPost(data);
    } catch (err) {
      setError("Error al cargar el artículo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayDate = (createdAt?: string): string => {
    if (!createdAt) return new Date().toLocaleDateString('es-ES');
    return new Date(createdAt).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-32">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-muted-foreground">Cargando artículo...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-32">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-light text-architectural mb-8">
                {error ? "Error al cargar el artículo" : "Post Not Found"}
              </h1>
              <Link 
                to="/blog" 
                className="text-minimal text-foreground hover:text-muted-foreground transition-colors duration-300"
              >
                ← BACK TO BLOG
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Article Header */}
      <article className="pt-32 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link 
              to="/blog" 
              className="inline-block text-minimal text-muted-foreground hover:text-foreground transition-colors duration-300 mb-12"
            >
              ← BACK TO BLOG
            </Link>
            
            {/* Article Meta */}
            <div className="mb-8">
              <div className="flex items-center text-minimal text-muted-foreground space-x-4 mb-6 flex-wrap gap-2">
                <span className="bg-muted px-3 py-1 text-foreground">{post.category || "General"}</span>
                <span>{getDisplayDate(post.createdAt)}</span>
                <span>•</span>
                <span>{post.readTime || "5 min read"}</span>
                <span>•</span>
                <span>{post.author?.firstName || "AGENTIKA"}</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-light text-architectural mb-6">
                {post.title}
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            </div>
            
            {/* Featured Image */}
            {(post.cover || post.thumbnail) && (
              <div className="w-full h-96 mb-12 overflow-hidden rounded-lg">
                <img 
                  src={post.cover || post.thumbnail} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
            
            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div 
                className="text-muted-foreground leading-relaxed space-y-6"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <div className="flex gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blog?tag=${tag}`}
                      className="text-xs bg-muted px-3 py-1.5 rounded-full text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPostPage;