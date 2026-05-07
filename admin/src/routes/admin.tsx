import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { store } from "@/lib/store";

// Verificación síncrona directa de localStorage - no depende del estado del store
function isAuthenticatedSync(): boolean {
  if (typeof window === 'undefined') return false;
  const token = window.localStorage.getItem('auth_token');
  const userJson = window.localStorage.getItem('auth_user');
  if (!token || !userJson) return false;
  try {
    const user = JSON.parse(userJson);
    return user && (user.role === 'admin' || user.role === 'super_admin');
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    // 1. Verificación SINCRÓNICA inmediata desde localStorage
    if (isAuthenticatedSync()) {
      // Sincronizar store para que los componentes tengan acceso al usuario
      store.syncAuthFromStorage();
      return;
    }
    
    // 2. Si no hay datos en localStorage, verificar estado del store
    const state = store.getState();
    if (state.authed && state.user) {
      if (state.user.role !== 'admin' && state.user.role !== 'super_admin') {
        throw redirect({ to: "/login" });
      }
      return;
    }
    
    // 3. Intentar restaurar desde token
    const restored = await store.restoreAuth();
    
    if (!restored) {
      throw redirect({ to: "/login" });
    }
    
    const newState = store.getState();
    if (!newState.user || (newState.user.role !== 'admin' && newState.user.role !== 'super_admin')) {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
