import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Users as UsersIcon, KanbanSquare, CheckSquare,
  Mail, BarChart3, Settings, LogOut, Sparkles, ChevronLeft, ChevronRight,
  User,
} from "lucide-react";
import { useState } from "react";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin",          label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/blog",     label: "Blog",      icon: FileText },
  { to: "/admin/leads",    label: "Leads",     icon: UsersIcon },
  { to: "/admin/pipeline", label: "Pipeline",  icon: KanbanSquare },
  { to: "/admin/tasks",    label: "Tareas",    icon: CheckSquare },
  { to: "/admin/emails",   label: "Emails",    icon: Mail },
  { to: "/admin/analytics",label: "Analytics", icon: BarChart3 },
  { to: "/admin/users",    label: "Usuarios",  icon: UsersIcon, protected: true, roles: ['super_admin', 'admin'] as const },
  { to: "/admin/settings", label: "Ajustes",   icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const user = store.getState().user;

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const canAccess = (item: any) => {
    if (!item.protected) return true;
    if (!user) return false;
    if (item.roles) return item.roles.includes(user.role);
    return user.role === 'super_admin' || user.role === 'admin';
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shrink-0 glow-primary">
            <Sparkles className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold tracking-tight text-sidebar-foreground leading-none">AGENTIKA</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Admin</div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {nav.filter(canAccess).map((item) => {
          const active = isActive(item.to, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all relative",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-primary rounded-r" />
              )}
              <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2 space-y-1">
        <Link
          to="/admin/profile"
          className={cn(
            "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
            path === "/admin/profile"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
          title={collapsed ? "Perfil" : undefined}
        >
          <User className="size-[18px]" />
          {!collapsed && <span>Mi Perfil</span>}
        </Link>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? <ChevronRight className="size-[18px]" /> : <ChevronLeft className="size-[18px]" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
        <button
          onClick={() => store.logout()}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-destructive/15 hover:text-destructive transition-colors"
          title="Cerrar sesión"
        >
          <LogOut className="size-[18px]" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
