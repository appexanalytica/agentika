import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, FileText, Mail, TrendingUp, ArrowUpRight, Calendar, Sparkles, Plus,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader, StatCard, Badge } from "@/components/admin/ui-bits";
import { leadsAPI, blogAPI, tasksAPI, analyticsAPI, type Lead, type BlogPost, type Task } from "@/hooks/useAPI";
import { useState, useEffect } from "react";
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

const leadStatusMeta: Record<Lead['status'], { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: 'bg-success/15 text-success border-success/30' },
  contactado: { label: 'Contactado', color: 'bg-info/15 text-info border-info/30' },
  calificado: { label: 'Calificado', color: 'bg-warning/15 text-warning border-warning/30' },
  propuesta: { label: 'Propuesta', color: 'bg-primary/15 text-primary border-primary/30' },
  cerrado: { label: 'Cerrado', color: 'bg-muted text-muted-foreground border-border' },
  perdido: { label: 'Perdido', color: 'bg-destructive/15 text-destructive border-destructive/30' },
};

function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visitsData, setVisitsData] = useState<Array<{ date: string; visits: number; leads: number }>>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadsData, postsData, tasksData, visitsData] = await Promise.all([
        leadsAPI.getLeads(1, 100),
        blogAPI.getPosts(1, 100),
        tasksAPI.getTasks(),
        analyticsAPI.getVisitsByDateRange(14),
      ]);
      setLeads(leadsData.leads);
      setPosts(postsData.posts);
      setTasks(tasksData);
      setVisitsData(visitsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const newLeads = leads.filter((l) => l.status === "nuevo").length;
  const wonValue = leads.filter((l) => l.status === "cerrado").reduce((s, l) => s + (l.value || 0), 0);
  const pendingTasks = tasks.filter((t) => t.status !== "hecho").length;
  const published = posts.filter((p) => p.status === "published").length;

  const recentLeads = [...leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);

  // Generate source breakdown from real data
  const sourceCounts = leads.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sourceBreakdown = Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));

  // Format visits data for chart
  const visitsLast14Days = visitsData.map((v: { date: string; visits: number; leads: number }, i: number) => {
    const date = new Date(v.date);
    return {
      day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      visitas: v.visits,
      leads: v.leads,
    };
  });

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

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
        <StatCard label="Pipeline ganado" value={`${(wonValue / 1000).toFixed(1)}k €`} delta={`${newLeads} nuevos leads`} icon={<TrendingUp className="size-5" />} accent="success" />
        <StatCard label="Tareas pendientes" value={pendingTasks} icon={<Calendar className="size-5" />} accent="warning" />
        <StatCard label="Artículos publicados" value={published} delta={`${posts.length - published} en borrador`} icon={<FileText className="size-5" />} accent="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Visits chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold tracking-tight">Tráfico web · últimos 14 días</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Visitas y leads generados</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30">
              <ArrowUpRight className="size-3" /> +24%
            </Badge>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </div>

        {/* Sources */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold tracking-tight">Fuentes de leads</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">Distribución por origen</p>
          <div className="h-72 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                  key={l._id} to="/admin/leads"
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
                    <p className="text-xs text-muted-foreground truncate">{l.company || '—'} · {formatDistanceToNow(new Date(l.createdAt), { addSuffix: true, locale: es })}</p>
                  </div>
                  <span className="text-sm font-mono text-primary opacity-0 group-hover:opacity-100 transition">{l.value && l.value > 0 ? `${(l.value / 1000).toFixed(0)}k€` : "—"}</span>
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
            <p className="text-center text-xs text-muted-foreground py-8 italic">Sin emails registrados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
