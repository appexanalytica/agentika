import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/ui-bits";
import { Sparkles, User, Bell, Database, Mail, Key } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Ajustes | AGENTIKA Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <PageHeader title="Ajustes" description="Configuración del panel y la cuenta." />

      <div className="space-y-5">
        <Section icon={<User className="size-5" />} title="Perfil" description="Información del administrador">
          <Field label="Nombre" defaultValue="Admin AGENTIKA" />
          <Field label="Email" defaultValue="admin@agentika.com" type="email" />
        </Section>

        <Section icon={<Bell className="size-5" />} title="Notificaciones" description="Avisos por nueva actividad">
          <Toggle label="Email en cada nuevo lead" defaultChecked />
          <Toggle label="Resumen diario por email" defaultChecked />
          <Toggle label="Aviso al recibir bounce" />
        </Section>

        <Section icon={<Mail className="size-5" />} title="Email transaccional" description="Provider para envíos del CRM">
          <Field label="From address" defaultValue="hola@agentika.com" />
          <Field label="Reply-to" defaultValue="ventas@agentika.com" />
        </Section>

        <Section icon={<Key className="size-5" />} title="API Keys" description="Conexiones a servicios externos">
          <p className="text-sm text-muted-foreground">No hay claves configuradas todavía. Conecta el backend para gestionarlas de forma segura.</p>
        </Section>

        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 p-6">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Database className="size-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">Activa el backend <Sparkles className="size-4 text-primary" /></h3>
              <p className="text-sm text-muted-foreground mt-1">Todo lo que ves en este panel funciona con datos mock en memoria. Activa Lovable Cloud para persistir leads, blog, emails y autenticación real con un solo click.</p>
              <button disabled className="mt-3 inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed">
                Conectar backend
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-primary">{icon}</div>
        <div>
          <h3 className="font-semibold tracking-tight">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, defaultValue, type = "text" }: { label: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <input type={type} defaultValue={defaultValue} className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative w-10 h-5 bg-muted rounded-full peer-checked:bg-primary transition before:content-[''] before:absolute before:top-0.5 before:left-0.5 before:size-4 before:bg-card before:rounded-full before:transition peer-checked:before:translate-x-5" />
    </label>
  );
}
