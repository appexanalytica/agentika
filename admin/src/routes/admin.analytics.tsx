import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend, PieChart, Pie, Cell,
} from "recharts";
import { PageHeader, StatCard, Badge } from "@/components/admin/ui-bits";
import { Eye, MousePointerClick, TrendingUp, Target, Calendar, Globe, FileText, Download } from "lucide-react";
import { analyticsAPI } from "@/hooks/useAPI";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics | AGENTIKA Admin" }] }),
  component: AnalyticsPage,
});

const LEAD_STATUS_COLORS: Record<string, string> = {
  nuevo: "oklch(0.88 0.22 130)",
  contactado: "oklch(0.72 0.18 250)",
  calificado: "oklch(0.78 0.18 320)",
  propuesta: "oklch(0.82 0.17 75)",
  cerrado: "oklch(0.65 0.20 150)",
  perdido: "oklch(0.55 0.20 25)",
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  calificado: "Calificado",
  propuesta: "Propuesta",
  cerrado: "Cerrado",
  perdido: "Perdido",
};

function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [pipelineValue, setPipelineValue] = useState<any>(null);
  const [topBlogPosts, setTopBlogPosts] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [metricsData, pipelineData, blogData, referrerData] = await Promise.all([
        analyticsAPI.getDashboardMetrics(days),
        analyticsAPI.getPipelineValue(),
        analyticsAPI.getTopBlogPosts(5),
        analyticsAPI.getReferrers(days, 10),
      ]);
      setMetrics(metricsData);
      setPipelineValue(pipelineData);
      setTopBlogPosts(blogData);
      setReferrers(referrerData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      ['Fecha', 'Visitas', 'Leads'],
      ...(metrics?.visitsByDay || []).map((v: any) => [
        v.date,
        v.visits,
        v.leads,
      ]),
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${days}days-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  const visitsByDayFormatted = metrics?.visitsByDay?.map((v: any) => ({
    ...v,
    day: format(new Date(v.date), 'EEE', { locale: es }),
  })) || [];

  const leadsByStatusChart = metrics?.leadsByStatus?.map((l: any) => ({
    name: LEAD_STATUS_LABELS[l.status] || l.status,
    value: l.count,
    fill: LEAD_STATUS_COLORS[l.status] || "#888",
  })) || [];

  const maxBlogViews = Math.max(...topBlogPosts.map((p) => p.views), 1);
  const maxReferrerVisits = Math.max(...referrers.map((r) => r.count), 1);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Analytics"
        description="Métricas de marketing, conversión y CRM."
        actions={
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={14}>Últimos 14 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
            >
              <Download className="size-4" />
              Exportar
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Visitas totales"
          value={metrics?.totalVisits?.toLocaleString() || '0'}
          icon={<Eye className="size-5" />}
          accent="accent"
        />
        <StatCard
          label="Leads totales"
          value={metrics?.totalLeads?.toLocaleString() || '0'}
          icon={<Target className="size-5" />}
          accent="primary"
        />
        <StatCard
          label="Tasa conversión"
          value={`${metrics?.conversionRate?.toFixed(1) || 0}%`}
          icon={<MousePointerClick className="size-5" />}
          accent="warning"
        />
        <StatCard
          label="Pipeline activo"
          value={`${((pipelineValue?.active || 0) / 1000).toFixed(0)}k €`}
          icon={<TrendingUp className="size-5" />}
          accent="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-1">Tendencia visitas vs leads</h3>
          <p className="text-xs text-muted-foreground mb-4">Correlación últimos {Math.min(days, 14)} días</p>
          <div className="h-72 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={visitsByDayFormatted} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="day" stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.014 265)", border: "1px solid oklch(0.28 0.016 265)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="visits" name="Visitas" stroke="oklch(0.88 0.22 130)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="oklch(0.72 0.18 250)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-1">Leads por estado</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribución actual del pipeline</p>
          <div className="h-72 min-h-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={leadsByStatusChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leadsByStatusChart.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.20 0.014 265)", border: "1px solid oklch(0.28 0.016 265)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Top páginas</h3>
          <div className="space-y-3">
            {metrics?.topPages?.slice(0, 5).map((page: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="truncate font-medium">{page.page}</span>
                  <span className="font-mono text-xs text-muted-foreground ml-3">{page.visits.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                    style={{ width: `${(page.visits / (metrics.topPages[0]?.visits || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Fuentes de tráfico</h3>
          <div className="space-y-3">
            {referrers.slice(0, 5).map((ref: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between items-center text-sm mb-1.5">
                  <span className="truncate font-medium flex items-center gap-2">
                    <Globe className="size-3" />
                    {ref.referrer || 'Directo'}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground ml-3">{ref.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-accent-glow rounded-full"
                    style={{ width: `${(ref.count / maxReferrerVisits) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Top artículos del blog</h3>
        <div className="space-y-3">
          {topBlogPosts.map((post) => (
            <div key={post.slug}>
              <div className="flex justify-between items-center text-sm mb-1.5">
                <span className="truncate font-medium flex items-center gap-2">
                  <FileText className="size-3" />
                  {post.title}
                </span>
                <span className="font-mono text-xs text-muted-foreground ml-3">{post.views.toLocaleString()} vistas</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                  style={{ width: `${(post.views / maxBlogViews) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Pipeline</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Activo</span>
              <span className="font-medium">{((pipelineValue?.active || 0) / 1000).toFixed(1)}k €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ganado</span>
              <span className="font-medium text-success">{((pipelineValue?.won || 0) / 1000).toFixed(1)}k €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Perdido</span>
              <span className="font-medium text-destructive">{((pipelineValue?.lost || 0) / 1000).toFixed(1)}k €</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Resumen leads</h3>
          <div className="space-y-2">
            {metrics?.leadsByStatus?.slice(0, 3).map((l: any) => (
              <div key={l.status} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{LEAD_STATUS_LABELS[l.status] || l.status}</span>
                <span className="font-medium">{l.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-2">Conversión</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Visitas → Leads</span>
              <span className="font-medium">{metrics?.conversionRate?.toFixed(2) || 0}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Leads/visita</span>
              <span className="font-medium">
                {metrics?.totalVisits > 0
                  ? (metrics.totalLeads / metrics.totalVisits).toFixed(2)
                  : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
