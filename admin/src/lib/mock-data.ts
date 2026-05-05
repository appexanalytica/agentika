// Mock data for AGENTIKA admin — replace with real backend later

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

const now = Date.now();
const days = (n: number) => new Date(now - n * 86400000).toISOString();

export const mockLeads: Lead[] = [
  {
    id: "l1", name: "María González", email: "maria@acmetech.es", phone: "+34 612 345 678",
    company: "Acme Tech", message: "Necesitamos automatizar nuestro proceso de onboarding con un agente de IA.",
    status: "cualificado", tags: ["enterprise", "automatización"], source: "Formulario web",
    value: 12000, createdAt: days(2),
    notes: [{ id: "n1", text: "Demo agendada para el viernes. Equipo de 50 personas.", createdAt: days(1), author: "Tú" }],
  },
  {
    id: "l2", name: "Carlos Ruiz", email: "carlos@startuplab.io", company: "StartupLab",
    message: "Interesados en chatbot para soporte al cliente.", status: "contactado",
    tags: ["startup", "chatbot"], source: "LinkedIn", value: 4500, createdAt: days(5),
    notes: [],
  },
  {
    id: "l3", name: "Laura Pérez", email: "laura@retailpro.com", phone: "+34 699 111 222",
    company: "RetailPro", message: "Queremos un agente que gestione devoluciones automáticamente.",
    status: "propuesta", tags: ["retail", "enterprise"], source: "Referido",
    value: 24000, createdAt: days(8),
    notes: [{ id: "n2", text: "Propuesta enviada. Esperando feedback de dirección.", createdAt: days(3), author: "Tú" }],
  },
  {
    id: "l4", name: "Diego Martín", email: "diego@fintechx.es", company: "FintechX",
    message: "Análisis automático de documentos financieros con IA.", status: "nuevo",
    tags: ["fintech"], source: "Formulario web", value: 8000, createdAt: days(0),
    notes: [],
  },
  {
    id: "l5", name: "Ana Torres", email: "ana@edutech.org", company: "EduTech",
    message: "Tutor virtual con IA para alumnos.", status: "ganado",
    tags: ["edu", "cerrado"], source: "Formulario web", value: 18000, createdAt: days(30),
    notes: [{ id: "n3", text: "Contrato firmado. Kickoff lunes.", createdAt: days(2), author: "Tú" }],
  },
  {
    id: "l6", name: "Pablo Sánchez", email: "pablo@logistica.es", company: "Logística Plus",
    message: "Consulta sobre precios.", status: "perdido",
    tags: ["logística"], source: "Formulario web", value: 0, createdAt: days(45),
    notes: [{ id: "n4", text: "Presupuesto fuera de su rango.", createdAt: days(40), author: "Tú" }],
  },
  {
    id: "l7", name: "Sofía Jiménez", email: "sofia@medai.es", company: "MedAI",
    message: "Agentes para triaje médico inicial.", status: "nuevo",
    tags: ["healthcare"], source: "Formulario web", value: 30000, createdAt: days(1),
    notes: [],
  },
];

export const mockPosts: BlogPost[] = [
  {
    id: "p1",
    title: "Cómo los agentes de IA están transformando el soporte al cliente",
    slug: "agentes-ia-soporte-cliente",
    excerpt: "Descubre cómo las empresas reducen un 70% sus tiempos de respuesta con agentes inteligentes.",
    content: `# Cómo los agentes de IA están transformando el soporte al cliente

Los **agentes de IA** ya no son ciencia ficción. En 2025, las empresas que los implementan están viendo mejoras drásticas en eficiencia.

## Beneficios clave

- Respuesta 24/7 sin coste adicional
- Reducción del 70% en tiempos de espera
- Escalado infinito sin contratar

## Casos de uso reales

> "Implementamos AGENTIKA y en 3 meses redujimos el coste de soporte un 45%" — Cliente Enterprise

\`\`\`typescript
const agent = createAgent({
  name: "Soporte L1",
  tools: [searchKB, escalateToHuman],
});
\`\`\`

[Lee el caso completo aquí](#).`,
    status: "publicado",
    category: "Casos de uso",
    tags: ["IA", "soporte", "automatización"],
    author: "AGENTIKA Team",
    seoTitle: "Agentes de IA en soporte al cliente | AGENTIKA",
    seoDescription: "Guía completa sobre cómo implementar agentes de IA en tu equipo de soporte.",
    publishedAt: days(7),
    updatedAt: days(7),
    views: 1248,
  },
  {
    id: "p2",
    title: "5 errores al implementar IA en tu empresa (y cómo evitarlos)",
    slug: "5-errores-implementar-ia",
    excerpt: "La mayoría de proyectos de IA fracasan por las mismas razones. Aquí está cómo evitarlas.",
    content: `# 5 errores al implementar IA

## 1. No definir el problema
Antes de elegir el modelo, define **claramente** qué problema resuelves.

## 2. Datos de baja calidad
Garbage in, garbage out.

## 3. Falta de medición
Si no mides, no mejoras.`,
    status: "publicado",
    category: "Estrategia",
    tags: ["IA", "estrategia", "errores"],
    author: "AGENTIKA Team",
    publishedAt: days(14),
    updatedAt: days(14),
    views: 892,
  },
  {
    id: "p3",
    title: "El futuro del trabajo con agentes autónomos",
    slug: "futuro-trabajo-agentes-autonomos",
    excerpt: "Borrador en progreso sobre agentes multi-step y su impacto laboral.",
    content: `# El futuro del trabajo

Borrador en construcción...

## Ideas

- Agentes que negocian
- Coordinación multi-agente
- Implicaciones éticas`,
    status: "borrador",
    category: "Tendencias",
    tags: ["futuro", "agentes"],
    author: "AGENTIKA Team",
    updatedAt: days(1),
    views: 0,
  },
  {
    id: "p4",
    title: "Guía: integra un agente IA en tu CRM en 30 minutos",
    slug: "integrar-agente-ia-crm",
    excerpt: "Tutorial paso a paso con código.",
    content: `# Integra un agente IA en tu CRM

## Paso 1: Conectar la API
\`\`\`bash
npm install @agentika/sdk
\`\`\``,
    status: "programado",
    category: "Tutoriales",
    tags: ["tutorial", "CRM", "API"],
    author: "AGENTIKA Team",
    publishedAt: days(-3),
    updatedAt: days(2),
    views: 0,
  },
];

export const mockTasks: Task[] = [
  { id: "t1", title: "Llamar a María González (demo)", status: "pendiente", dueDate: days(-1), leadId: "l1", priority: "alta" },
  { id: "t2", title: "Enviar propuesta a Laura Pérez", status: "en_curso", dueDate: days(-2), leadId: "l3", priority: "alta" },
  { id: "t3", title: "Seguimiento Carlos Ruiz", status: "pendiente", dueDate: days(-5), leadId: "l2", priority: "media" },
  { id: "t4", title: "Kickoff EduTech", status: "hecho", dueDate: days(0), leadId: "l5", priority: "alta" },
  { id: "t5", title: "Revisar borrador 'futuro del trabajo'", status: "pendiente", dueDate: days(-3), priority: "baja" },
];

export const mockEmails: EmailLog[] = [
  { id: "e1", to: "maria@acmetech.es", subject: "Confirmación demo viernes", template: "demo-reminder", sentAt: days(1), status: "abierto", leadId: "l1" },
  { id: "e2", to: "laura@retailpro.com", subject: "Propuesta AGENTIKA — RetailPro", template: "proposal", sentAt: days(3), status: "abierto", leadId: "l3" },
  { id: "e3", to: "carlos@startuplab.io", subject: "Seguimiento conversación", template: "follow-up", sentAt: days(2), status: "enviado", leadId: "l2" },
  { id: "e4", to: "ana@edutech.org", subject: "Bienvenida a AGENTIKA", template: "welcome", sentAt: days(28), status: "abierto", leadId: "l5" },
];

export const leadStatusMeta: Record<LeadStatus, { label: string; color: string }> = {
  nuevo:       { label: "Nuevo",       color: "bg-info/15 text-info border-info/30" },
  contactado:  { label: "Contactado",  color: "bg-accent/15 text-accent border-accent/30" },
  cualificado: { label: "Cualificado", color: "bg-primary/15 text-primary border-primary/30" },
  propuesta:   { label: "Propuesta",   color: "bg-warning/15 text-warning border-warning/30" },
  ganado:      { label: "Ganado",      color: "bg-success/15 text-success border-success/30" },
  perdido:     { label: "Perdido",     color: "bg-destructive/15 text-destructive border-destructive/30" },
};

export const pipelineColumns: LeadStatus[] = ["nuevo", "contactado", "cualificado", "propuesta", "ganado", "perdido"];

// Analytics mock
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
