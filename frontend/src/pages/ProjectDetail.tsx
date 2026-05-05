import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { useBlog } from "@/hooks/useAPI";
import { ArrowLeft, Calendar, Tag, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getPosts } = useBlog();

  useEffect(() => {
    const loadProject = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await getPosts(1, 100, 'published');
        
        const found = (data.posts || []).find((post: any) => post.slug === slug);
        
        if (found) {
          setProject(found);
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

    loadProject();
  }, [slug, getPosts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-muted-foreground">Cargando proyecto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto text-center">
              <p className="text-muted-foreground mb-4">{error || "Proyecto no encontrado"}</p>
              <Link to="/work" className="text-foreground hover:text-muted-foreground transition-colors">
                Volver a proyectos
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
      
      {/* Header */}
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <Link 
              to="/work" 
              className="inline-flex items-center gap-2 text-minimal text-muted-foreground hover:text-foreground transition-colors duration-300 mb-8"
            >
              <ArrowLeft className="size-4" />
              VOLVER A PROYECTOS
            </Link>
            
            <div className="space-y-8">
              <div>
                <p className="text-minimal text-muted-foreground mb-4">
                  {(project.category || 'GENERAL').toUpperCase()}
                </p>
                <h1 className="text-5xl md:text-7xl font-light text-architectural">
                  {project.title.toUpperCase()}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {project.publishedAt
                    ? new Date(project.publishedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })
                    : new Date(project.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  {project.readTime || "5 min read"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {project.cover && (
        <section className="pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="overflow-hidden rounded-sm">
                <img
                  src={project.cover}
                  alt={project.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Excerpt */}
            {project.excerpt && (
              <div className="mb-16">
                <p className="text-2xl text-muted-foreground leading-relaxed">
                  {project.excerpt}
                </p>
              </div>
            )}

            {/* Markdown Content */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {project.content}
              </ReactMarkdown>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="size-4 text-muted-foreground" />
                  <p className="text-minimal text-muted-foreground">TAGS</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {project.tags.map((tag: string) => (
                    <span key={tag} className="text-minimal text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Back to Work */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              to="/work" 
              className="inline-block text-minimal text-foreground hover:text-muted-foreground transition-colors duration-300 relative group"
            >
              VER MÁS PROYECTOS
              <span className="absolute bottom-0 left-0 w-full h-px bg-foreground group-hover:bg-muted-foreground transition-colors duration-300"></span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;
