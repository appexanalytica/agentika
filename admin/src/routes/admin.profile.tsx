import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { store } from "@/lib/store";
import { User, Mail, Shield, Calendar, Save, Loader2, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({ meta: [{ title: "Perfil | AGENTIKA Admin" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = store.getState().user;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState("");
  const [pwdError, setPwdError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const { usersAPI } = await import("@/lib/api");
      await usersAPI.update(user!.id, form);
      setMessage("Perfil actualizado correctamente");
      await store.restoreAuth();
    } catch (err: any) {
      setError(err.message || "Error al actualizar perfil");
    }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdMessage("");

    if (pwdForm.newPassword.length < 8) {
      setPwdError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("Las contraseñas no coinciden");
      return;
    }

    setPwdLoading(true);
    try {
      const { authAPI } = await import("@/lib/api");
      await authAPI.changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      setPwdMessage("Contraseña cambiada correctamente");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPwdError(err.message || "Error al cambiar contraseña");
    }
    setPwdLoading(false);
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "super_admin": return "Super Administrador";
      case "admin": return "Administrador";
      default: return "Usuario";
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "super_admin": return "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300";
      case "admin": return "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300";
      default: return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No hay sesión activa</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Mi Perfil</h1>
      <p className="text-sm text-muted-foreground mb-8">Gestiona tu información personal y seguridad</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <User className="size-10 text-primary" />
            </div>
            <h2 className="font-semibold text-lg">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
            <span className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
              <Shield className="size-3" />
              {getRoleLabel(user.role)}
            </span>
            <div className="mt-4 space-y-2 text-left">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                {user.email || "Sin email"}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="size-4" />
                Miembro desde {new Date(user.createdAt).toLocaleDateString("es-ES")}
              </div>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Profile */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="size-4 text-primary" />
              Información Personal
            </h3>
            {message && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                {message}
              </div>
            )}
            {error && (
              <div className="mb-4 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Apellido</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                <Save className="size-4" />
                Guardar Cambios
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Lock className="size-4 text-primary" />
              Cambiar Contraseña
            </h3>
            {pwdMessage && (
              <div className="mb-4 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
                {pwdMessage}
              </div>
            )}
            {pwdError && (
              <div className="mb-4 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {pwdError}
              </div>
            )}
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña Actual</label>
                <input
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                  className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nueva Contraseña</label>
                <input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  className="mt-1.5 w-full bg-input border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={pwdLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60"
              >
                {pwdLoading && <Loader2 className="size-4 animate-spin" />}
                <Lock className="size-4" />
                Cambiar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
