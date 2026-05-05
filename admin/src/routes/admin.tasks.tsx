import { createFileRoute } from "@tanstack/react-router";
import { Check, Plus, AlertCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import {
  DndContext, type DragEndEvent, useDraggable, useDroppable, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { tasksAPI, type Task } from "@/hooks/useAPI";
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<'alta' | 'media' | 'baja'>('media');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const groups = {
    pendiente: tasks.filter(t => t.status === "pendiente"),
    en_curso:  tasks.filter(t => t.status === "en_curso"),
    hecho:     tasks.filter(t => t.status === "hecho"),
  };

  const add = async () => {
    if (!newTitle.trim()) return;
    try {
      await tasksAPI.createTask({
        title: newTitle.trim(),
        status: "pendiente",
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: newPriority,
      });
      setNewTitle("");
      setNewPriority('media');
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      await tasksAPI.toggleTaskStatus(taskId);
      loadTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const taskId = e.active.id as string;
    const newStatus = e.over?.id as Task['status'] | undefined;
    if (newStatus && ['pendiente', 'en_curso', 'hecho'].includes(newStatus)) {
      try {
        await tasksAPI.updateTask(taskId, { status: newStatus });
        loadTasks();
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }
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
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as 'alta' | 'media' | 'baja')}
          className="bg-input border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
        <button onClick={add} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary">
          <Plus className="size-4" /> Añadir
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Cargando tareas...</p>
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(["pendiente", "en_curso", "hecho"] as const).map((g) => (
              <TaskColumn key={g} status={g} tasks={groups[g]} onToggle={toggleTask} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function TaskColumn({ status, tasks, onToggle }: { status: Task['status'], tasks: Task[], onToggle: (taskId: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`bg-card border border-border rounded-xl p-4 transition-all ${isOver ? "border-primary/60 bg-primary/5" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm capitalize">{status.replace("_", " ")}</h3>
        <Badge>{tasks.length}</Badge>
      </div>
      <div className="space-y-2">
        {tasks.map((t) => {
          const overdue = t.status !== "hecho" && isPast(new Date(t.dueDate));
          return (
            <TaskCard key={t._id} task={t} onToggle={onToggle} overdue={overdue} />
          );
        })}
        {tasks.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-8 italic">Sin tareas</p>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, overdue }: { task: Task, onToggle: (taskId: string) => void, overdue: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`bg-muted/30 border border-border rounded-lg p-3 flex items-start gap-3 hover:border-primary/30 transition cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40 shadow-2xl" : ""}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task._id); }}
        className={`size-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${task.status === "hecho" ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"}`}
      >
        {task.status === "hecho" && <Check className="size-3" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status === "hecho" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge className={priorityColor[task.priority as keyof typeof priorityColor]}>{task.priority}</Badge>
          <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
            {overdue ? <AlertCircle className="size-3" /> : <Clock className="size-3" />}
            {format(new Date(task.dueDate), "dd MMM", { locale: es })}
          </span>
        </div>
      </div>
    </div>
  );
}
