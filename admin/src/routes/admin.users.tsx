import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Shield, User as UserIcon, Lock, Check, X, Trash2, Key } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { PageHeader, Badge } from "@/components/admin/ui-bits";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { usersAPI, type User } from "@/hooks/useAPI";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Usuarios | AGENTIKA Admin" }] }),
  component: UsersList,
});

const roleColor: Record<User['role'], string> = {
  superadmin: "bg-destructive/15 text-destructive border-destructive/30",
  admin: "bg-primary/15 text-primary border-primary/30",
  user: "bg-muted text-muted-foreground border-border",
};

const roleLabel: Record<User['role'], string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  user: "Usuario",
};

const roleIcon: Record<User['role'], any> = {
  superadmin: Shield,
  admin: UserIcon,
  user: Lock,
};

function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getUsers();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = useMemo(() => {
    return users
      .filter((u) => {
        if (filter === "active") return u.isActive;
        if (filter === "inactive") return !u.isActive;
        return true;
      })
      .filter((u) =>
        (u.username || "").toLowerCase().includes(q.toLowerCase()) ||
        (u.firstName || "").toLowerCase().includes(q.toLowerCase()) ||
        (u.lastName || "").toLowerCase().includes(q.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [users, q, filter]);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await usersAPI.updateUserStatus(userId, !currentStatus);
      loadUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await usersAPI.deleteUser(userId);
      loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const getStoredUser = (): User | null => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  };

  const storedUser = getStoredUser();

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios del sistema y sus permisos."
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-glow transition glow-primary"
          >
            <Plus className="size-4" /> Nuevo usuario
          </button>
        }
      />

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, usuario o email…"
            className="w-full bg-input border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? "Todos" : f === "active" ? "Activos" : "Inactivos"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Cargando usuarios...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No hay usuarios encontrados</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Creado</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const RoleIcon = roleIcon[user.role];
                const isCurrentUser = storedUser?.id === user._id;
                const canDelete = storedUser?.role === 'superadmin' && user.role !== 'superadmin' && !isCurrentUser;
                const canToggleStatus = storedUser?.role === 'superadmin' || (storedUser?.role === 'admin' && user.role !== 'superadmin');

                return (
                  <tr key={user._id} className="border-b border-border hover:bg-muted/30 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">@{user.username}</div>
                        {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={roleColor[user.role]}>
                        <RoleIcon className="size-3 mr-1" />
                        {roleLabel[user.role]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={user.isActive ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}>
                        {user.isActive ? <Check className="size-3 mr-1" /> : <X className="size-3 mr-1" />}
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(user.updatedAt), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canToggleStatus && !isCurrentUser && (
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            className="size-8 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                            title={user.isActive ? "Desactivar" : "Activar"}
                          >
                            {user.isActive ? <X className="size-4" /> : <Check className="size-4" />}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="size-8 rounded-md hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition"
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadUsers();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<"superadmin" | "admin" | "user">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isSuperadmin = storedUser.role === 'superadmin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await usersAPI.createUser({
        username,
        email,
        password,
        firstName,
        lastName,
        role,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Error al crear usuario");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-[var(--shadow-elegant)]">
        <h2 className="text-xl font-semibold mb-4">Crear nuevo usuario</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre</label>
              <input
                type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
                className="mt-1.5 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Apellido</label>
              <input
                type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)}
                className="mt-1.5 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</label>
            <input
              type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email (opcional)</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contraseña</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</label>
            <select
              value={role} onChange={(e) => setRole(e.target.value as any)}
              className="mt-1.5 w-full bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
              {isSuperadmin && <option value="superadmin">Superadmin</option>}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button" onClick={onClose}
              className="flex-1 bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted/80 transition"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-glow transition glow-primary disabled:opacity-60"
            >
              {loading ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
