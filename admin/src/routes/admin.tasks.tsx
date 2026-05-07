import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { useStore, store } from "@/lib/store";
import { format, isPast } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/admin/tasks")({
  head: () => ({ meta: [{ title: "Tareas | AGENTIKA Admin" }] }),
  component: TasksPage,
});

const priorityColor = {
  alta:  "bg-destructive/15 text-destructive border-destructive/30",
  media: "bg-warning/15 text-warning border-warning/30",
  baja:  "bg-muted text-muted-foreground border-border",
};

function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const [newTitle, setNewTitle] = useState("");

  const groups = {
    pendiente: tasks.filter(t => t.status === "pendiente"),
    en_curso:  tasks.filter(t => t.status === "en_curso"),
    hecho:     tasks.filter(t => t.status === "hecho"),
  };

  const add = () => {
    if (!newTitle.trim()) return;
    store.addTask({
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      status: "pendiente",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      priority: "media",
    });
    setNewTitle("");
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Tareas" description="Recordatorios y seguimientos del equipo." />

      <div className="flex gap-2 mb-6">
        <input
          value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Nueva tarea… (Enter para añadir)"
          className="flex-1 bg-input border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button onClick={add} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary">
          <Plus className="size-4" /> Añadir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(["pendiente", "en_curso", "hecho"] as const).map((g) => (
          <div key={g} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm capitalize">{g.replace("_", " ")}</h3>
              <Badge>{groups[g].length}</Badge>
            </div>
            <div className="space-y-2">
              {groups[g].map((t) => {
                const overdue = t.status !== "hecho" && isPast(new Date(t.dueDate));
                return (
                  <div key={t.id} className="bg-muted/30 border border-border rounded-lg p-3 flex items-start gap-3 hover:border-primary/30 transition">
                    <button
                      onClick={() => store.toggleTask(t.id)}
                      className={`size-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${t.status === "hecho" ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"}`}
                    >
                      {t.status === "hecho" && <Check className="size-3" strokeWidth={3} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${t.status === "hecho" ? "line-through text-muted-foreground" : ""}`}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge className={priorityColor[t.priority]}>{t.priority}</Badge>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                          {overdue ? <AlertCircle className="size-3" /> : <Clock className="size-3" />}
                          {format(new Date(t.dueDate), "dd MMM", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {groups[g].length === 0 && (
                <p className="text-center text-xs text-muted-foreground py-8 italic">Sin tareas</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
