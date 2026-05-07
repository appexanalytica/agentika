// Type definitions for AGENTIKA admin - data now comes from real backend API

export type LeadStatus = "nuevo" | "contactado" | "cualificado" | "propuesta" | "ganado" | "perdido";
export type PostStatus = "borrador" | "publicado" | "programado";
export type TaskStatus = "pendiente" | "en_curso" | "hecho";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  status: LeadStatus;
  tags: string[];
  source: string;
  value: number; // EUR
  createdAt: string;
  notes: { id: string; text: string; createdAt: string; author: string }[];
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // markdown
  cover?: string;
  status: PostStatus;
  category: string;
  tags: string[];
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  updatedAt: string;
  views: number;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string;
  leadId?: string;
  priority: "alta" | "media" | "baja";
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  template: string;
  sentAt: string;
  status: "enviado" | "abierto" | "rebotado";
  leadId?: string;
}

export const leadStatusMeta: Record<LeadStatus, { label: string; color: string }> = {
  nuevo:       { label: "Nuevo",       color: "bg-info/15 text-info border-info/30" },
  contactado:  { label: "Contactado",  color: "bg-accent/15 text-accent border-accent/30" },
  cualificado: { label: "Cualificado", color: "bg-primary/15 text-primary border-primary/30" },
  propuesta:   { label: "Propuesta",   color: "bg-warning/15 text-warning border-warning/30" },
  ganado:      { label: "Ganado",      color: "bg-success/15 text-success border-success/30" },
  perdido:     { label: "Perdido",     color: "bg-destructive/15 text-destructive border-destructive/30" },
};

export const pipelineColumns: LeadStatus[] = ["nuevo", "contactado", "cualificado", "propuesta", "ganado", "perdido"];

// UI constants for charts (visualization configuration, not actual data)
const now = Date.now();
const days = (n: number) => new Date(now - n * 86400000).toISOString();

export const visitsLast14Days = Array.from({ length: 14 }, (_, i) => ({
  day: new Date(now - (13 - i) * 86400000).toLocaleDateString("es", { day: "2-digit", month: "short" }),
  visitas: Math.floor(200 + Math.random() * 400 + i * 30),
  leads: Math.floor(2 + Math.random() * 8),
}));

export const sourceBreakdown = [
  { name: "Formulario web", value: 45 },
  { name: "LinkedIn", value: 25 },
  { name: "Referidos", value: 18 },
  { name: "Búsqueda orgánica", value: 12 },
];
