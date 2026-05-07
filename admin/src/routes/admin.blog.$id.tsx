import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Save, Eye, Send, Image as ImageIcon, Bold, Italic, Link2, List, Heading1, Heading2, Code, Quote } from "lucide-react";
import { useStore, store } from "@/lib/store";
import type { BlogPost, PostStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/blog/$id")({
  head: () => ({ meta: [{ title: "Editor | AGENTIKA Admin" }] }),
  component: () => {
    const { id } = useParams({ from: "/admin/blog/$id" });
    return <BlogEditor postId={id} />;
  },
});

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function BlogEditor({ postId, newPost }: { postId?: string; newPost?: boolean }) {
  const navigate = useNavigate();
  const posts = useStore((s) => s.posts);

  const isNew = newPost || postId === "new" || !postId;
  const existing = useMemo(() => (isNew ? undefined : posts.find((p) => p.id === postId)), [posts, postId, isNew]);

  const [post, setPost] = useState<BlogPost>(() =>
    existing ?? {
      id: crypto.randomUUID(),
      title: "",
      slug: "",
      excerpt: "",
      content: "# Nuevo artículo\n\nEmpieza a escribir aquí...",
      status: "borrador",
      category: "General",
      tags: [],
      author: "AGENTIKA Team",
      seoTitle: "",
      seoDescription: "",
      updatedAt: new Date().toISOString(),
      views: 0,
    }
  );
  const [tagInput, setTagInput] = useState("");
  const [tab, setTab] = useState<"editor" | "preview" | "split">("split");

  useEffect(() => {
    if (!isNew && existing) setPost(existing);
  }, [existing, isNew]);

  const update = <K extends keyof BlogPost>(k: K, v: BlogPost[K]) => setPost((p) => ({ ...p, [k]: v }));

  const onTitleChange = (title: string) => {
    setPost((p) => ({ ...p, title, slug: !p.slug || p.slug === slugify(p.title) ? slugify(title) : p.slug }));
  };

  const insertMd = (before: string, after = "") => {
    if (typeof document === "undefined") return;
    const ta = document.getElementById("md-textarea") as HTMLTextAreaElement | null;
    if (!ta) return;
    const start = ta.selectionStart, end = ta.selectionEnd;
    const sel = post.content.slice(start, end);
    const newContent = post.content.slice(0, start) + before + sel + after + post.content.slice(end);
    update("content", newContent);
    setTimeout(() => { ta.focus(); ta.selectionEnd = start + before.length + sel.length; }, 0);
  };

  const save = (newStatus?: PostStatus) => {
    const updated: BlogPost = {
      ...post,
      status: newStatus ?? post.status,
      slug: post.slug || slugify(post.title),
      updatedAt: new Date().toISOString(),
      publishedAt: (newStatus === "publicado" || post.status === "publicado") ? (post.publishedAt ?? new Date().toISOString()) : post.publishedAt,
    };
    store.upsertPost(updated);
    navigate({ to: "/admin/blog" });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !post.tags.includes(t)) update("tags", [...post.tags, t]);
    setTagInput("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Editor topbar */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 px-8 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/admin/blog" className="size-9 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{isNew ? "Nuevo artículo" : "Editando"} · <span className="text-primary">{post.status}</span></p>
              <p className="text-sm font-medium truncate">{post.title || "Sin título"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-card border border-border rounded-lg p-1">
              {(["editor", "split", "preview"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded text-xs font-medium transition ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {t === "editor" ? "Editor" : t === "split" ? "Split" : "Preview"}
                </button>
              ))}
            </div>
            <button onClick={() => save("borrador")} className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted transition">
              <Save className="size-3.5" /> Guardar borrador
            </button>
            <button onClick={() => save("publicado")} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary-glow transition glow-primary">
              <Send className="size-3.5" /> Publicar
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Editor area */}
        <div className="space-y-4">
          <input
            value={post.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Título del artículo…"
            className="w-full bg-transparent text-3xl font-bold tracking-tight focus:outline-none placeholder:text-muted-foreground/50 px-1 py-2"
          />
          <input
            value={post.slug}
            onChange={(e) => update("slug", slugify(e.target.value))}
            placeholder="slug-del-articulo"
            className="w-full bg-transparent text-sm font-mono text-muted-foreground focus:outline-none focus:text-primary px-1"
          />

          {/* Toolbar */}
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card flex-wrap">
            {[
              { i: <Heading1 className="size-4" />, fn: () => insertMd("# ") },
              { i: <Heading2 className="size-4" />, fn: () => insertMd("## ") },
              { i: <Bold className="size-4" />,     fn: () => insertMd("**", "**") },
              { i: <Italic className="size-4" />,   fn: () => insertMd("*", "*") },
              { i: <Link2 className="size-4" />,    fn: () => insertMd("[", "](url)") },
              { i: <ImageIcon className="size-4" />,fn: () => insertMd("![alt](", ")") },
              { i: <List className="size-4" />,     fn: () => insertMd("- ") },
              { i: <Code className="size-4" />,     fn: () => insertMd("`", "`") },
              { i: <Quote className="size-4" />,    fn: () => insertMd("> ") },
            ].map((b, idx) => (
              <button key={idx} onClick={b.fn} className="size-8 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition flex items-center justify-center">
                {b.i}
              </button>
            ))}
          </div>

          <div className={`grid gap-4 ${tab === "split" ? "lg:grid-cols-2" : "grid-cols-1"}`}>
            {(tab === "editor" || tab === "split") && (
              <textarea
                id="md-textarea"
                value={post.content}
                onChange={(e) => update("content", e.target.value)}
                spellCheck={false}
                className="min-h-[600px] w-full bg-card border border-border rounded-xl p-5 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            )}
            {(tab === "preview" || tab === "split") && (
              <div className="min-h-[600px] w-full bg-card border border-border rounded-xl p-6 overflow-auto">
                <article className="prose-admin">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {post.content || "*Vista previa vacía*"}
                  </ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar settings */}
        <aside className="space-y-4">
          <Section title="Resumen">
            <textarea
              value={post.excerpt} onChange={(e) => update("excerpt", e.target.value)}
              placeholder="Resumen corto que aparecerá en listados…"
              rows={3}
              className="w-full bg-input border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </Section>

          <Section title="Categoría">
            <select
              value={post.category} onChange={(e) => update("category", e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {["General", "Casos de uso", "Estrategia", "Tendencias", "Tutoriales", "Producto"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Section>

          <Section title="Tags">
            <div className="flex gap-1 flex-wrap mb-2">
              {post.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs">
                  {t}
                  <button onClick={() => update("tags", post.tags.filter((x) => x !== t))} className="text-muted-foreground hover:text-destructive">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Añadir tag…"
                className="flex-1 bg-input border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button onClick={addTag} className="px-3 bg-secondary text-secondary-foreground rounded-lg text-xs hover:bg-muted">+</button>
            </div>
          </Section>

          <Section title="Imagen de portada (URL)">
            <input
              value={post.cover ?? ""} onChange={(e) => update("cover", e.target.value)}
              placeholder="https://…"
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {post.cover && <img src={post.cover} alt="cover" className="mt-2 rounded-lg w-full aspect-video object-cover border border-border" />}
          </Section>

          <Section title="SEO">
            <input
              value={post.seoTitle ?? ""} onChange={(e) => update("seoTitle", e.target.value)}
              placeholder="Title SEO (≤60)" maxLength={70}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 mb-2"
            />
            <textarea
              value={post.seoDescription ?? ""} onChange={(e) => update("seoDescription", e.target.value)}
              placeholder="Meta description (≤160)" rows={3} maxLength={170}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{(post.seoTitle ?? "").length}/60</span>
              <span>{(post.seoDescription ?? "").length}/160</span>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">{title}</h3>
      {children}
    </div>
  );
}
