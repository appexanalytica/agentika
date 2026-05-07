import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  LineChart, Line, Legend,
} from "recharts";
import { PageHeader, StatCard } from "@/components/admin/ui-bits";
import { Eye, MousePointerClick, TrendingUp, Target } from "lucide-react";
import { useStore } from "@/lib/store";
import { analyticsAPI } from "@/lib/api";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics | AGENTIKA Admin" }] }),
  component: AnalyticsPage,
});

const conversionData = [
  { stage: "Visitantes", count: 4280 },
  { stage: "Vieron precio", count: 1820 },
  { stage: "Formulario", count: 412 },
  { stage: "Contactados", count: 198 },
  { stage: "Cualificados", count: 87 },
  { stage: "Ganados", count: 24 },
];

function AnalyticsPage() {
  const leads = useStore((s) => s.leads);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [dashboard, visits] = await Promise.all([
          analyticsAPI.getDashboard().catch(() => null),
          analyticsAPI.getVisits({ days: 14 }).catch(() => null),
        ]);
        setAnalyticsData({ dashboard, visits });
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const wonValue = leads.filter(l => l.status === "ganado").reduce((s, l) => s + l.value, 0);
  const pipelineValue = leads.filter(l => l.status !== "perdido" && l.status !== "ganado").reduce((s, l) => s + l.value, 0);

  const visitsData = analyticsData?.visits || [];
  const totalVisits = visitsData.reduce((s: number, d: any) => s + (d.visitas || d.visits || 0), 0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Analytics" description="Métricas de marketing, conversión y CRM." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Visitas totales (14d)" value={totalVisits.toLocaleString()} icon={<Eye className="size-5" />} accent="accent" delta="+24% MoM" />
        <StatCard label="Tasa conversión" value={analyticsData?.dashboard?.conversionRate || "2.4%"} icon={<MousePointerClick className="size-5" />} accent="primary" delta="+0.3pp" />
        <StatCard label="Pipeline activo" value={`${(pipelineValue / 1000).toFixed(0)}k €`} icon={<Target className="size-5" />} accent="warning" />
        <StatCard label="Cerrado (mes)" value={`${(wonValue / 1000).toFixed(0)}k €`} icon={<TrendingUp className="size-5" />} accent="success" delta="+18%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-1">Embudo de conversión</h3>
          <p className="text-xs text-muted-foreground mb-4">Visitantes → Clientes (últimos 30 días)</p>
          <div className="h-72 min-h-[288px] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionData} layout="vertical" margin={{ top: 8, right: 16, left: 70, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" horizontal={false} />
                <XAxis type="number" stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="stage" stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.014 265)", border: "1px solid oklch(0.28 0.016 265)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="oklch(0.88 0.22 130)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-1">Tendencia visitas vs leads</h3>
          <p className="text-xs text-muted-foreground mb-4">Correlación últimos 14 días</p>
          <div className="h-72 min-h-[288px] overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitsData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="day" stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.66 0.018 265)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.014 265)", border: "1px solid oklch(0.28 0.016 265)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="visitas" stroke="oklch(0.88 0.22 130)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leads" stroke="oklch(0.72 0.18 250)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold mb-4">Top artículos del blog</h3>
        <BlogTopList />
      </div>

      {loading && (
        <div className="text-center py-8 text-muted-foreground">
          Cargando datos de analytics...
        </div>
      )}
    </div>
  );
}

function BlogTopList() {
  const posts = useStore(s => s.posts);
  const top = [...posts].filter(p => p.status === "publicado").sort((a, b) => b.views - a.views).slice(0, 5);
  const max = Math.max(...top.map(p => p.views), 1);

  return (
    <div className="space-y-3">
      {top.map((p) => (
        <div key={p.id}>
          <div className="flex justify-between items-center text-sm mb-1.5">
            <span className="truncate font-medium">{p.title}</span>
            <span className="font-mono text-xs text-muted-foreground ml-3">{p.views.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full" style={{ width: `${(p.views/max)*100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
