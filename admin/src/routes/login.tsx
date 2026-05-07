import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { store } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login | AGENTIKA Admin" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await store.adminLogin(usernameOrEmail, password);

    if (result.success) {
      navigate({ to: "/admin" });
    } else {
      setError(result.error || "Error al iniciar sesión");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center glow-primary">
            <Sparkles className="size-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold text-2xl tracking-tight">AGENTIKA</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground -mt-0.5">Admin Console</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-elegant)]">
          <h1 className="text-xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
          <p className="text-sm text-muted-foreground mt-1">Accede al panel de administración</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario o Email</label>
              <input
                id="username"
                name="username"
                type="text" required value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-2.5 text-sm hover:bg-primary-glow transition glow-primary disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Entrar al panel
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()} AGENTIKA · Panel privado
        </p>
      </div>
    </div>
  );
}
