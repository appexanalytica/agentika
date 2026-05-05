import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Search, Mail, Phone, Building2, Tag, MessageSquare, Trash2, X, Send } from "lucide-react";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { leadsAPI, type Lead } from "@/hooks/useAPI";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({ meta: [{ title: "Leads | AGENTIKA Admin" }] }),
  component: LeadsPage,
});

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | Lead['status']>("all");
  const [selected, setSelected] = useState<Lead | null>(null);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsAPI.getLeads(1, 100, filter === 'all' ? undefined : filter);
      setLeads(data.leads);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [filter]);

  const filtered = useMemo(() => {
    return leads
      .filter((l) =>
        l.name.toLowerCase().includes(q.toLowerCase()) ||
        l.email.toLowerCase().includes(q.toLowerCase()) ||
        (l.company ?? "").toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [leads, q]);

  const leadStatusMeta: Record<Lead['status'], { label: string; color: string }> = {
    nuevo: { label: 'Nuevo', color: 'bg-success/15 text-success border-success/30' },
    contactado: { label: 'Contactado', color: 'bg-info/15 text-info border-info/30' },
    calificado: { label: 'Calificado', color: 'bg-warning/15 text-warning border-warning/30' },
    propuesta: { label: 'Propuesta', color: 'bg-primary/15 text-primary border-primary/30' },
    cerrado: { label: 'Cerrado', color: 'bg-muted text-muted-foreground border-border' },
    perdido: { label: 'Perdido', color: 'bg-destructive/15 text-destructive border-destructive/30' },
  };

  const pipelineColumns: Lead['status'][] = ['nuevo', 'contactado', 'calificado', 'propuesta', 'cerrado', 'perdido'];

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader title="Leads" description={`${leads.length} contactos · ${leads.filter(l=>l.status==="nuevo").length} nuevos`} />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar nombre, email o empresa…"
            className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 overflow-x-auto">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Todos</button>
          {pipelineColumns.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${filter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {leadStatusMeta[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-medium px-5 py-3">Contacto</th>
              <th className="text-left font-medium px-5 py-3">Empresa</th>
              <th className="text-left font-medium px-5 py-3">Estado</th>
              <th className="text-left font-medium px-5 py-3">Origen</th>
              <th className="text-right font-medium px-5 py-3">Valor</th>
              <th className="text-left font-medium px-5 py-3">Recibido</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-muted-foreground text-sm">Cargando leads...</td></tr>
            ) : filtered.map((l) => {
              const meta = leadStatusMeta[l.status];
              return (
                <tr key={l._id} onClick={() => setSelected(l)} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gradient-to-br from-accent/30 to-accent/0 flex items-center justify-center text-sm font-semibold text-accent shrink-0">
                        {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{l.name}</p>
                        <p className="text-xs text-muted-foreground truncate font-mono">{l.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{l.company ?? "—"}</td>
                  <td className="px-5 py-4"><Badge className={meta.color}>{meta.label}</Badge></td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{l.source}</td>
                  <td className="px-5 py-4 text-right font-mono">{l.value && l.value > 0 ? `${(l.value/1000).toFixed(0)}k €` : "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{formatDistanceToNow(new Date(l.createdAt), { addSuffix: true, locale: es })}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-16 text-center text-muted-foreground text-sm">Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && <LeadDrawer lead={leads.find(l => l._id === selected._id) ?? selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [note, setNote] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const leadStatusMeta: Record<Lead['status'], { label: string; color: string }> = {
    nuevo: { label: 'Nuevo', color: 'bg-success/15 text-success border-success/30' },
    contactado: { label: 'Contactado', color: 'bg-info/15 text-info border-info/30' },
    calificado: { label: 'Calificado', color: 'bg-warning/15 text-warning border-warning/30' },
    propuesta: { label: 'Propuesta', color: 'bg-primary/15 text-primary border-primary/30' },
    cerrado: { label: 'Cerrado', color: 'bg-muted text-muted-foreground border-border' },
    perdido: { label: 'Perdido', color: 'bg-destructive/15 text-destructive border-destructive/30' },
  };

  const pipelineColumns: Lead['status'][] = ['nuevo', 'contactado', 'calificado', 'propuesta', 'cerrado', 'perdido'];

  const updateStatus = async (status: Lead['status']) => {
    try {
      await leadsAPI.updateLeadStatus(lead._id, status);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating lead status:', error);
      alert('Error al actualizar estado');
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    try {
      await leadsAPI.addLeadNote(lead._id, { text: note, author: 'Admin' });
      setNote("");
      window.location.reload();
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error al agregar nota');
    }
  };

  const deleteLead = async () => {
    try {
      await leadsAPI.deleteLead(lead._id);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error al eliminar lead');
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex">
      <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl h-full bg-card border-l border-border overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 bg-card/90 backdrop-blur border-b border-border p-5 flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-base font-semibold">
              {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg truncate">{lead.name}</h2>
              <p className="text-xs text-muted-foreground truncate">{lead.company} · {lead.source}</p>
            </div>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Quick actions */}
          <div className="flex gap-2">
            <a href={`mailto:${lead.email}`} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary-glow transition">
              <Mail className="size-3.5" /> Email
            </a>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex-1 inline-flex items-center justify-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg text-xs font-semibold hover:bg-muted transition">
                <Phone className="size-3.5" /> Llamar
              </a>
            )}
            <button onClick={() => { if (confirm("¿Eliminar este lead?")) { deleteLead(); } }} className="size-9 bg-destructive/15 text-destructive rounded-lg hover:bg-destructive/25 transition flex items-center justify-center">
              <Trash2 className="size-4" />
            </button>
          </div>

          {/* Status selector */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Estado</label>
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {pipelineColumns.map((s) => {
                const m = leadStatusMeta[s];
                const active = lead.status === s;
                return (
                  <button key={s} onClick={() => updateStatus(s)}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium border transition ${active ? m.color : "border-border text-muted-foreground hover:bg-muted"}`}>
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-3.5" /><span className="font-mono text-xs">{lead.email}</span></div>
            {lead.phone && <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-3.5" /><span className="font-mono text-xs">{lead.phone}</span></div>}
            {lead.company && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="size-3.5" /><span>{lead.company}</span></div>}
            {lead.value && lead.value > 0 && <div className="flex items-center gap-2 text-primary font-semibold"><Tag className="size-3.5" /><span className="font-mono">{lead.value.toLocaleString()} €</span></div>}
          </div>

          {/* Tags */}
          {lead.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {lead.tags.map((t) => <Badge key={t} className="bg-accent/15 text-accent border-accent/30">{t}</Badge>)}
            </div>
          )}

          {/* Message */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Mensaje original</label>
            <p className="mt-2 text-sm bg-muted/30 border border-border rounded-lg p-4 leading-relaxed">{lead.message}</p>
          </div>

          {/* Quick email composer */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5"><Send className="size-3" /> Enviar email rápido</label>
            <div className="mt-2 space-y-2">
              <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Asunto…" className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Mensaje…" rows={3} className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`} className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-xs font-semibold hover:bg-primary-glow transition text-center block">Enviar email</a>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5"><MessageSquare className="size-3" /> Notas internas</label>
            <div className="mt-2 space-y-2">
              {lead.notes.map((n) => (
                <div key={n.id} className="bg-muted/30 border border-border rounded-lg p-3 text-sm">
                  <p>{n.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">{n.author} · {format(new Date(n.createdAt), "dd MMM HH:mm", { locale: es })}</p>
                </div>
              ))}
              {lead.notes.length === 0 && <p className="text-xs text-muted-foreground italic">Sin notas todavía.</p>}
              <div className="flex gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && note.trim()) { addNote(); } }} placeholder="Añadir nota… (Enter para guardar)" className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
