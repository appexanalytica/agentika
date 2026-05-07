import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { useStore, store } from "@/lib/store";
import type { PostStatus } from "@/lib/mock-data";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/admin/blog/")({
  head: () => ({ meta: [{ title: "Blog | AGENTIKA Admin" }] }),
  component: BlogList,
});

const statusColor: Record<PostStatus, string> = {
  publicado:  "bg-success/15 text-success border-success/30",
  borrador:   "bg-muted text-muted-foreground border-border",
  programado: "bg-info/15 text-info border-info/30",
};

function BlogList() {
  const posts = useStore((s) => s.posts);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | PostStatus>("all");

  const filtered = useMemo(() => {
    return posts
      .filter((p) => filter === "all" || p.status === filter)
      .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())))
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
          {(["all", "publicado", "borrador", "programado"] as const).map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
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
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                <td className="px-5 py-4">
                  <Link to="/admin/blog/$id" params={{ id: p.id }} className="font-medium hover:text-primary transition flex items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="line-clamp-1">{p.title}</span>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">/{p.slug}</p>
                </td>
                <td className="px-5 py-4"><Badge className={statusColor[p.status]}>{p.status}</Badge></td>
                <td className="px-5 py-4 text-muted-foreground">{p.category}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {(p.tags || []).slice(0, 3).map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>
                </td>
                <td className="px-5 py-4 text-right font-mono text-muted-foreground">{p.views.toLocaleString()}</td>
                <td className="px-5 py-4 text-muted-foreground text-xs">{format(new Date(p.updatedAt), "dd MMM yyyy", { locale: es })}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link to="/admin/blog/$id" params={{ id: p.id }} className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition" title="Editar">
                      <Pencil className="size-4" />
                    </Link>
                    <button onClick={() => { if (confirm(`¿Eliminar "${p.title}"?`)) store.deletePost(p.id); }} className="size-8 rounded-md hover:bg-destructive/15 flex items-center justify-center text-muted-foreground hover:text-destructive transition" title="Eliminar">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-muted-foreground text-sm">
                  <Eye className="size-8 mx-auto mb-2 opacity-40" />
                  No hay artículos que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
