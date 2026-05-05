import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  DndContext, type DragEndEvent, useDraggable, useDroppable, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { leadsAPI, type Lead } from "@/hooks/useAPI";

export const Route = createFileRoute("/admin/pipeline")({
  head: () => ({ meta: [{ title: "Pipeline | AGENTIKA Admin" }] }),
  component: PipelinePage,
});

const pipelineColumns: Lead['status'][] = ['nuevo', 'contactado', 'calificado', 'propuesta', 'cerrado', 'perdido'];

const leadStatusMeta: Record<Lead['status'], { label: string; color: string }> = {
  nuevo: { label: 'Nuevo', color: 'bg-success/15 text-success border-success/30' },
  contactado: { label: 'Contactado', color: 'bg-info/15 text-info border-info/30' },
  calificado: { label: 'Calificado', color: 'bg-warning/15 text-warning border-warning/30' },
  propuesta: { label: 'Propuesta', color: 'bg-primary/15 text-primary border-primary/30' },
  cerrado: { label: 'Cerrado', color: 'bg-muted text-muted-foreground border-border' },
  perdido: { label: 'Perdido', color: 'bg-destructive/15 text-destructive border-destructive/30' },
};

function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsAPI.getLeads(1, 100);
      setLeads(data.leads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<Lead['status'], Lead[]> = { nuevo: [], contactado: [], calificado: [], propuesta: [], cerrado: [], perdido: [] };
    for (const l of leads) g[l.status].push(l);
    return g;
  }, [leads]);

  const totalByCol: Record<Lead['status'], number> = useMemo(
    () => Object.fromEntries(pipelineColumns.map((c) => [c, grouped[c].reduce((s, l) => s + (l.value || 0), 0)])) as Record<Lead['status'], number>,
    [grouped]
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const leadId = e.active.id as string;
    const newStatus = e.over?.id as Lead['status'] | undefined;
    if (newStatus && pipelineColumns.includes(newStatus)) {
      try {
        await leadsAPI.updateLeadStatus(leadId, newStatus);
        loadLeads();
      } catch (error) {
        console.error('Error updating lead status:', error);
      }
    }
  };

  return (
    <div className="p-8 max-w-[1800px] mx-auto">
      <PageHeader
        title="Pipeline de ventas"
        description="Arrastra los leads entre columnas para actualizar su estado."
      />

      {loading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Cargando pipeline...</p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {pipelineColumns.map((status) => (
              <Column key={status} status={status} leads={grouped[status]} total={totalByCol[status]} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function Column({ status, leads, total }: { status: Lead['status']; leads: Lead[]; total: number }) {
  const meta = leadStatusMeta[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`rounded-xl border bg-card/40 transition-all ${isOver ? "border-primary/60 bg-primary/5" : "border-border"}`}>
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <Badge className={meta.color}>{meta.label}</Badge>
          <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">{leads.length} · {(total/1000).toFixed(1)}k €</p>
        </div>
      </div>
      <div className="p-2 space-y-2 min-h-[200px]">
        {leads.map((lead) => <Card key={lead._id} lead={lead} />)}
      </div>
    </div>
  );
}

function Card({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead._id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition ${isDragging ? "opacity-40 shadow-2xl" : ""}`}
    >
      <p className="font-medium text-sm truncate">{lead.name}</p>
      <p className="text-xs text-muted-foreground truncate">{lead.company || '—'}</p>
      {lead.value && lead.value > 0 && (
        <p className="mt-2 text-xs font-mono text-primary font-semibold">{(lead.value / 1000).toFixed(1)}k €</p>
      )}
      {lead.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mt-2">
          {lead.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
