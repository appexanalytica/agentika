import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { blogAPI, type BlogPost as APIBlogPost } from "@/hooks/useAPI";

export const Route = createFileRoute("/admin/blog/")({
  head: () => ({ meta: [{ title: "Blog | AGENTIKA Admin" }] }),
  component: BlogList,
});

type ApiStatus = "draft" | "published" | "archived";

const statusColor: Record<ApiStatus, string> = {
  published: "bg-success/15 text-success border-success/30",
  draft:     "bg-muted text-muted-foreground border-border",
  archived:  "bg-info/15 text-info border-info/30",
};

const statusLabel: Record<ApiStatus, string> = {
  published: "Publicado",
  draft:     "Borrador",
  archived:  "Archivado",
};

function BlogList() {
  const [posts, setPosts] = useState<APIBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | ApiStatus>("all");

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Cargar publicados y borradores por separado y combinar
      const [pub, draft, archived] = await Promise.all([
        blogAPI.getPosts(1, 100, "published"),
        blogAPI.getPosts(1, 100, "draft"),
        blogAPI.getPosts(1, 100, "archived"),
      ]);
      setPosts([
        ...(pub.posts || []),
        ...(draft.posts || []),
        ...(archived.posts || []),
      ]);
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const filtered = useMemo(() => {
    return posts
      .filter((p) => filter === "all" || p.status === filter)
      .filter((p) =>
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q.toLowerCase()))
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [posts, q, filter]);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Blog"
        description="Gestiona los artículos publicados y borradores."
        actions={
          <Link to="/admin/blog/new" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary">
            <Plus className="size-4" /> Nuevo artículo
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título o tag…"
            className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          {(["all", "published", "draft", "archived"] as const).map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? "Todos" : statusLabel[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-medium px-5 py-3">Título</th>
              <th className="text-left font-medium px-5 py-3">Estado</th>
              <th className="text-left font-medium px-5 py-3">Categoría</th>
              <th className="text-left font-medium px-5 py-3">Tags</th>
              <th className="text-right font-medium px-5 py-3">Vistas</th>
              <th className="text-left font-medium px-5 py-3">Actualizado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  Cargando artículos...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  <Eye className="size-8 mx-auto mb-2 opacity-40" />
                  No hay artículos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                  <td className="px-5 py-4">
                    <Link to="/admin/projects/$slug" params={{ slug: p.slug }} className="font-medium hover:text-primary transition flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <span className="line-clamp-1">{p.title}</span>
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">/{p.slug}</p>
                  </td>
                  <td className="px-5 py-4"><Badge className={statusColor[p.status as ApiStatus]}>{statusLabel[p.status as ApiStatus]}</Badge></td>
                  <td className="px-5 py-4 text-muted-foreground">{p.category || "General"}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {(p.tags || []).slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-muted-foreground">{p.views}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{format(new Date(p.updatedAt), "dd MMM yyyy", { locale: es })}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link to="/admin/projects/$slug" params={{ slug: p.slug }} className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition" title="Ver">
                        <Eye className="size-4" />
                      </Link>
                      <Link to="/admin/blog/$id" params={{ id: p._id }} className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition" title="Editar">
                        <Pencil className="size-4" />
                      </Link>
                      <button onClick={async () => {
                        if (confirm(`¿Eliminar "${p.title}"?`)) {
                          try {
                            await blogAPI.deletePost(p._id);
                            setPosts(posts.filter(post => post._id !== p._id));
                          } catch (error) {
                            console.error('Error deleting post:', error);
                            alert('Error al eliminar el artículo');
                          }
                        }
                      }} className="size-8 rounded-md hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive transition" title="Eliminar">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
