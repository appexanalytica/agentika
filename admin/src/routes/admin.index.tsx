import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users, FileText, Mail, TrendingUp, ArrowUpRight, Calendar, Sparkles, Plus,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader, StatCard, Badge } from "@/components/admin/ui-bits";
import { useStore } from "@/lib/store";
import { visitsLast14Days, sourceBreakdown, leadStatusMeta } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard | AGENTIKA Admin" }] }),
  component: Dashboard,
});

const PIE_COLORS = [
  "oklch(0.88 0.22 130)",
  "oklch(0.72 0.18 250)",
  "oklch(0.78 0.18 320)",
  "oklch(0.82 0.17 75)",
];

function Dashboard() {
  const [mounted, setMounted] = useState(false);

  const leads = useStore((s) => s.leads);
  const posts = useStore((s) => s.posts);
  const tasks = useStore((s) => s.tasks);
  const emails = useStore((s) => s.emails);

  const newLeads = leads.filter((l) => l.status === "nuevo").length;
  const wonValue = leads.filter((l) => l.status === "ganado").reduce((s, l) => s + l.value, 0);
  const pendingTasks = tasks.filter((t) => t.status !== "hecho").length;
  const published = posts.filter((p) => p.status === "publicado").length;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <PageHeader
          title="Dashboard"
          description={`Hola 👋 — aquí está el pulso de AGENTIKA hoy.`}
          actions={
            <Link
              to="/admin/blog/new"
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary"
            >
              <Plus className="size-4" /> Nuevo artículo
            </Link>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Leads nuevos" value={newLeads} delta="+3 esta semana" icon={<Users className="size-5" />} accent="primary" />
          <StatCard label="Pipeline ganado" value={`${(wonValue / 1000).toFixed(1)}k €`} delta="+18% vs mes pasado" icon={<TrendingUp className="size-5" />} accent="success" />
          <StatCard label="Tareas pendientes" value={pendingTasks} icon={<Calendar className="size-5" />} accent="warning" />
          <StatCard label="Artículos publicados" value={published} delta={`${posts.length - published} en borrador`} icon={<FileText className="size-5" />} accent="accent" />
        </div>
      </div>
    );
  }

  const recentLeads = [...leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Dashboard"
        description={`Hola 👋 — aquí está el pulso de AGENTIKA hoy.`}
        actions={
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary"
          >
            <Plus className="size-4" /> Nuevo artículo
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Leads nuevos" value={newLeads} delta="+3 esta semana" icon={<Users className="size-5" />} accent="primary" />
        <StatCard label="Pipeline ganado" value={`${(wonValue / 1000).toFixed(1)}k €`} delta="+18% vs mes pasado" icon={<TrendingUp className="size-5" />} accent="success" />
        <StatCard label="Tareas pendientes" value={pendingTasks} icon={<Calendar className="size-5" />} accent="warning" />
        <StatCard label="Artículos publicados" value={published} delta={`${posts.length - published} en borrador`} icon={<FileText className="size-5" />} accent="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Visits chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Tráfico web · últimos 14 días</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Visitas y leads generados</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30">
              <ArrowUpRight className="size-3" /> +24%
            </Badge>
          </div>
          <div className="w-full min-w-0 h-[300px] min-h-[300px] overflow-hidden">
            {mounted && (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={visitsLast14Days} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.88 0.22 130)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="oklch(0.88 0.22 130)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.18 250)" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="oklch(0.72 0.18 250)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="day" stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.20 0.014 265)", border: "1px solid oklch(0.28 0.016 265)",
                      borderRadius: 8, fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="visitas" stroke="oklch(0.88 0.22 130)" strokeWidth={2} fill="url(#gVisits)" />
                  <Area type="monotone" dataKey="leads" stroke="oklch(0.72 0.18 250)" strokeWidth={2} fill="url(#gLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sources */}
        <div className="bg-card border border-border rounded-xl p-6 min-w-0">
          <h3 className="font-semibold tracking-tight">Fuentes de leads</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">Distribución por origen</p>
          <div className="w-full min-w-0 h-[300px] min-h-[300px] overflow-hidden">
            {mounted && (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={sourceBreakdown} dataKey="value" nameKey="name"
                    cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3}
                  >
                    {sourceBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} stroke="oklch(0.20 0.014 265)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom" iconType="circle" iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: "oklch(0.66 0.018 265)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Leads recientes</h3>
            <Link to="/admin/leads" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {recentLeads.map((l) => {
              const meta = leadStatusMeta[l.status];
              return (
                <Link
                  key={l.id} to="/admin/leads"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition group"
                >
                  <div className="size-9 rounded-lg bg-gradient-to-br from-accent/30 to-accent/0 flex items-center justify-center text-sm font-semibold text-accent">
                    {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{l.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${meta.color}`}>{meta.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{l.company} · {formatDistanceToNow(new Date(l.createdAt), { addSuffix: true, locale: es })}</p>
                  </div>
                  <span className="text-sm font-mono text-primary opacity-0 group-hover:opacity-100 transition">{l.value > 0 ? `${(l.value / 1000).toFixed(0)}k€` : "—"}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">Emails enviados</h3>
            <Link to="/admin/emails" className="text-xs text-primary hover:underline">Ver historial →</Link>
          </div>
          <div className="space-y-2">
            {emails.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition">
                <div className="size-9 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.subject}</p>
                  <p className="text-xs text-muted-foreground truncate font-mono">{e.to}</p>
                </div>
                <Badge className={
                  e.status === "abierto" ? "bg-success/15 text-success border-success/30" :
                  e.status === "rebotado" ? "bg-destructive/15 text-destructive border-destructive/30" :
                  "bg-muted text-muted-foreground border-border"
                }>{e.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 flex items-center gap-4">
        <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="size-6 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold">Conecta el backend cuando estés listo</h4>
          <p className="text-sm text-muted-foreground mt-0.5">Toda la UI funciona con datos mock. Activa Lovable Cloud para persistir leads, blog, emails y autenticación real.</p>
        </div>
      </div>
    </div>
  );
}
