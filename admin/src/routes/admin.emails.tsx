import { createFileRoute } from "@tanstack/react-router";
import { Mail, MailOpen, MailX } from "lucide-react";
import { PageHeader, Badge, StatCard } from "@/components/admin/ui-bits";
import { useStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export const Route = createFileRoute("/admin/emails")({
  head: () => ({ meta: [{ title: "Emails | AGENTIKA Admin" }] }),
  component: EmailsPage,
});

function EmailsPage() {
  const emails = useStore((s) => s.emails);
  const sent   = emails.length;
  const opened = emails.filter(e => e.status === "abierto").length;
  const bounced= emails.filter(e => e.status === "rebotado").length;
  const openRate = sent ? ((opened / sent) * 100).toFixed(0) : "0";

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <PageHeader title="Emails" description="Historial de envíos a tus leads (mock)." />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Enviados" value={sent} icon={<Mail className="size-5" />} accent="primary" />
        <StatCard label="Tasa de apertura" value={`${openRate}%`} icon={<MailOpen className="size-5" />} accent="success" delta={`${opened} abiertos`} />
        <StatCard label="Rebotados" value={bounced} icon={<MailX className="size-5" />} accent="warning" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <th className="text-left font-medium px-5 py-3">Destinatario</th>
              <th className="text-left font-medium px-5 py-3">Asunto</th>
              <th className="text-left font-medium px-5 py-3">Plantilla</th>
              <th className="text-left font-medium px-5 py-3">Estado</th>
              <th className="text-left font-medium px-5 py-3">Enviado</th>
            </tr>
          </thead>
          <tbody>
            {emails.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition">
                <td className="px-5 py-3 font-mono text-xs">{e.to}</td>
                <td className="px-5 py-3 font-medium">{e.subject}</td>
                <td className="px-5 py-3 text-muted-foreground"><Badge>{e.template}</Badge></td>
                <td className="px-5 py-3">
                  <Badge className={
                    e.status === "abierto" ? "bg-success/15 text-success border-success/30" :
                    e.status === "rebotado" ? "bg-destructive/15 text-destructive border-destructive/30" :
                    "bg-muted text-muted-foreground border-border"
                  }>{e.status}</Badge>
                </td>
                <td className="px-5 py-3 text-muted-foreground text-xs">{formatDistanceToNow(new Date(e.sentAt), { addSuffix: true, locale: es })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
