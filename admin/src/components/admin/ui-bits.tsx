import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title, description, actions, className,
}: {
  title: string; description?: string; actions?: ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-8", className)}>
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label, value, delta, icon, accent = "primary",
}: {
  label: string; value: string | number; delta?: string;
  icon: ReactNode; accent?: "primary" | "accent" | "success" | "warning";
}) {
  const accentMap = {
    primary: "from-primary/20 to-primary/0 text-primary",
    accent:  "from-accent/20 to-accent/0 text-accent",
    success: "from-success/20 to-success/0 text-success",
    warning: "from-warning/20 to-warning/0 text-warning",
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group">
      <div className={cn("absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br opacity-50 blur-2xl group-hover:opacity-80 transition-opacity", accentMap[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 tracking-tight">{value}</p>
          {delta && <p className="text-xs text-success mt-1.5 font-medium">{delta}</p>}
        </div>
        <div className={cn("size-10 rounded-lg bg-card border border-border flex items-center justify-center", accentMap[accent].split(" ").pop())}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Badge({
  children, className, variant = "default",
}: {
  children: ReactNode; className?: string;
  variant?: "default" | "outline";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
        variant === "default" && "bg-muted border-border text-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
