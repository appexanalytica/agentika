import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Eye, Calendar, Tag, FileText, Clock } from "lucide-react";
import { blogAPI, type BlogPost } from "@/hooks/useAPI";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const Route = createFileRoute("/admin/projects/$slug")({
  head: () => ({ meta: [{ title: "Proyecto | AGENTIKA Admin" }] }),
  component: () => {
    const { slug } = useParams({ from: "/admin/projects/$slug" });
    return <ProjectDetail slug={slug} />;
  },
});

function ProjectDetail({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [slug]);

  const loadProject = async () => {
    try {
      setLoading(true);
      // Buscar el post por slug - necesitamos buscar en todos los posts
      const [pub, draft] = await Promise.all([
        blogAPI.getPosts(1, 100, "published"),
        blogAPI.getPosts(1, 100, "draft"),
      ]);
      
      const allPosts = [...(pub.posts || []), ...(draft.posts || [])];
      const found = allPosts.find((p) => p.slug === slug);
      
      if (found) {
        setPost(found);
      } else {
        setError("Proyecto no encontrado");
      }
    } catch (err) {
      setError("Error al cargar el proyecto");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando proyecto...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "Proyecto no encontrado"}</p>
          <Link to="/admin/blog" className="text-primary hover:underline">
            Volver a proyectos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/blog" className="size-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <p className="text-xs text-muted-foreground">Proyecto</p>
              <p className="text-sm font-medium">{post.title}</p>
            </div>
          </div>
          <Link
            to="/admin/blog/$id"
            params={{ id: post._id }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary"
          >
            <Edit className="size-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main content */}
          <div className="space-y-6">
            {/* Cover image */}
            {post.cover && (
              <div className="rounded-xl overflow-hidden border border-border">
                <img src={post.cover} alt={post.title} className="w-full aspect-video object-cover" />
              </div>
            )}

            {/* Title and meta */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {post.publishedAt
                    ? format(new Date(post.publishedAt), "dd MMM yyyy", { locale: es })
                    : format(new Date(post.createdAt), "dd MMM yyyy", { locale: es })}
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="size-4" />
                  {post.views} vistas
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  {post.readTime || "5 min read"}
                </div>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="bg-muted/50 border border-border rounded-xl p-6">
                <p className="text-lg text-muted-foreground">{post.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="bg-card border border-border rounded-xl p-8">
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </article>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Status */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Estado</h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published' 
                    ? 'bg-success/15 text-success border-success/30' 
                    : post.status === 'draft'
                    ? 'bg-muted text-muted-foreground border-border'
                    : 'bg-info/15 text-info border-info/30'
                }`}>
                  {post.status === 'published' ? 'Publicado' : post.status === 'draft' ? 'Borrador' : 'Archivado'}
                </span>
              </div>
            </div>

            {/* Category */}
            {post.category && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4">Categoría</h3>
                <p className="text-muted-foreground">{post.category}</p>
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <Tag className="size-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-muted rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SEO info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">SEO</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Title</p>
                  <p className="font-mono text-xs">{post.seoTitle || post.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="font-mono text-xs">{post.seoDescription || post.excerpt?.substring(0, 100) || 'Sin descripción'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Slug</p>
                  <p className="font-mono text-xs">/{post.slug}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Acciones</h3>
              <div className="space-y-2">
                <Link
                  to="/admin/blog/$id"
                  params={{ id: post._id }}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary"
                >
                  <Edit className="size-4" />
                  Editar proyecto
                </Link>
                <button
                  onClick={async () => {
                    if (confirm(`¿Eliminar "${post.title}"?`)) {
                      try {
                        await blogAPI.deletePost(post._id);
                        navigate({ to: "/admin/blog" });
                      } catch (error) {
                        console.error('Error deleting post:', error);
                        alert('Error al eliminar el proyecto');
                      }
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-destructive/90 transition"
                >
                  <FileText className="size-4" />
                  Eliminar proyecto
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
