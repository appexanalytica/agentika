import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { store } from "@/lib/store";
import { authAPI } from "@/hooks/useAPI";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        navigate({ to: "/login" });
        setLoading(false);
        return;
      }

      try {
        // Validate token with backend
        await authAPI.getAdminProfile();
        setAuthenticated(true);
        store.login();
      } catch (error) {
        console.error('Auth validation failed:', error);
        localStorage.removeItem('auth_token');
        store.logout();
        navigate({ to: "/login" });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Verificando autenticación...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
