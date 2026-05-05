import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useBlog, type BlogPost } from "@/hooks/useAPI";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getPosts } = useBlog();
  
  const categories = ["ALL", "SUSTAINABILITY", "DESIGN", "URBAN PLANNING", "General", "Casos de uso", "Estrategia", "Tendencias", "Tutoriales", "Producto"];
  
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPosts(1, 100, 'published');
      setPosts(data.posts || []);
    } catch (err) {
      setError("Error al cargar los artículos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = activeCategory === "ALL" 
    ? posts 
    : posts.filter(post => {
        const category = post.category || "General";
        return category.toUpperCase() === activeCategory.toUpperCase();
      });

  const getDisplayDate = (createdAt?: string): string => {
    if (!createdAt) return new Date().toLocaleDateString('es-ES');
    return new Date(createdAt).toLocaleDateString('es-ES');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h1 className="text-6xl md:text-8xl font-light text-architectural mb-8">
                INSIGHTS
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl">
                Exploring the intersection of architecture, design, and human experience 
                through thoughtful analysis and contemporary perspectives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Categories */}
      <section className="pb-16">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-8 justify-center md:justify-start">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`text-minimal transition-colors duration-300 relative group ${
                    activeCategory === category 
                      ? "text-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                  <span className={`absolute bottom-0 left-0 w-full h-px bg-foreground transition-transform duration-300 origin-left ${
                    activeCategory === category 
                      ? "scale-x-100" 
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">Cargando artículos...</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && (
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-destructive">
                {error}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      {!loading && !error && (
        <section className="pb-32">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hay artículos en esta categoría.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                  {filteredPosts.map((post) => (
                    <article key={post._id} className="group">
                      <Link to={`/blog/${post._id}`} className="block">
                        <div className="relative overflow-hidden mb-6">
                          {post.cover || post.thumbnail ? (
                            <img 
                              src={post.cover || post.thumbnail} 
                              alt={post.title}
                              className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-64 bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                              <span className="text-muted-foreground text-center px-4 font-light">
                                {post.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1">
                            <span className="text-xs text-foreground font-medium">
                              {post.category || "General"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center text-xs text-muted-foreground space-x-4">
                            <span>{getDisplayDate(post.createdAt)}</span>
                            <span>•</span>
                            <span>{post.readTime || "5 min read"}</span>
                            <span>•</span>
                            <span>{post.author?.firstName || "AGENTIKA"}</span>
                          </div>
                          
                          <h2 className="text-xl lg:text-2xl font-light text-architectural group-hover:text-muted-foreground transition-colors duration-500">
                            {post.title}
                          </h2>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {post.excerpt}
                          </p>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex gap-2 flex-wrap pt-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] bg-muted px-2 py-1 rounded-full text-muted-foreground">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Blog;