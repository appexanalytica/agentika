import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Users, KanbanSquare, CheckSquare,
  Mail, BarChart3, Settings, LogOut, Sparkles, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

const allNav = [
  { to: "/admin",          label: "Dashboard", icon: LayoutDashboard, exact: true, roles: ['superadmin', 'admin', 'user'] },
  { to: "/admin/blog",     label: "Proyectos",      icon: FileText, roles: ['superadmin', 'admin', 'user'] },
  { to: "/admin/users",    label: "Usuarios",      icon: Users, roles: ['superadmin', 'admin'] },
  { to: "/admin/leads",    label: "Leads",     icon: KanbanSquare, roles: ['superadmin', 'admin', 'user'] },
  { to: "/admin/pipeline", label: "Pipeline",  icon: CheckSquare, roles: ['superadmin', 'admin', 'user'] },
  { to: "/admin/tasks",    label: "Tareas",    icon: Mail, roles: ['superadmin', 'admin', 'user'] },
  { to: "/admin/mail",     label: "Correo",    icon: BarChart3, roles: ['superadmin', 'admin'] },
  { to: "/admin/analytics",label: "Analytics", icon: Settings, roles: ['superadmin', 'admin'] },
  { to: "/admin/settings", label: "Ajustes",   icon: Settings, roles: ['superadmin'] },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const userRole = useMemo(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        return user.role || 'user';
      } catch {
        return 'user';
      }
    }
    return 'user';
  }, []);

  const nav = useMemo(() => {
    return allNav.filter(item => item.roles.includes(userRole as any));
  }, [userRole]);

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path === to || path.startsWith(to + "/");

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    navigate({ to: '/login' });
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
        {nav.map((item) => {
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
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? <ChevronRight className="size-[18px]" /> : <ChevronLeft className="size-[18px]" />}
          {!collapsed && <span>Colapsar</span>}
        </button>
        <button
          onClick={handleLogout}
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
