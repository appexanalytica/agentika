# Implementacion de Autenticacion y Autorizacion - AGENTIKA

## Resumen

Sistema completo de autenticacion y autorizacion implementado en el stack MERN con:
- **3 roles**: `super_admin`, `admin`, `user`
- **JWT** con access + refresh tokens
- **bcryptjs** con salt rounds 12
- **Rate limiting** en login (10 intentos / 15 min)
- **Validaciones** con express-validator
- **Proteccion** contra eliminar/desactivar el ultimo super_admin
- **Frontend** con rutas protegidas, manejo de sesion persistente, perfil y gestion de usuarios

---

## Archivos Creados/Modificados

### Backend

| Archivo | Descripcion |
|---------|-------------|
| `src/models/User.ts` | Modelo Mongoose con roles, bcrypt pre-save, comparePassword |
| `src/utils/jwt.ts` | Generacion/verificacion de tokens (access + refresh) |
| `src/utils/password.ts` | Helpers bcrypt (hash/compare) |
| `src/utils/validation.ts` | Validaciones express-validator para register/login/update |
| `src/middleware/auth.ts` | `authenticate` (JWT) + `authorizeRoles` (RBAC) |
| `src/middleware/rateLimit.ts` | Rate limiting por IP (generico + login) |
| `src/controllers/AuthController.ts` | Login, adminLogin, register, me, refresh, changePassword |
| `src/controllers/UserController.ts` | CRUD usuarios + toggle active + update password |
| `src/routes/auth.ts` | `/api/auth/*` endpoints publicos/protegidos |
| `src/routes/users.ts` | `/api/users/*` endpoints protegidos por rol |
| `src/routes/index.ts` | Router principal conectando auth + users |
| `src/index.ts` | Servidor + seed del primer super_admin |

### Frontend (Admin)

| Archivo | Descripcion |
|---------|-------------|
| `admin/src/lib/types.ts` | Tipos actualizados con `super_admin` role |
| `admin/src/lib/api.ts` | Agregado `authAPI.changePassword` |
| `admin/src/lib/store.ts` | Sin cambios - ya soporta roles |
| `admin/src/routes/admin.tsx` | Route guard con roles `super_admin`/`admin` |
| `admin/src/routes/login.tsx` | Login funcional sin cambios |
| `admin/src/routes/admin.profile.tsx` | **NUEVO** - Perfil + cambio de password |
| `admin/src/routes/admin.users.tsx` | Gestión de usuarios con roles actualizados |
| `admin/src/components/admin/AdminSidebar.tsx` | Agregado link "Mi Perfil" + roles dinamicos |

---

## Variables de Entorno (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/agentika

# JWT (cambiar en produccion!)
JWT_SECRET=clave_super_segura_y_larga_para_agentika_2024
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Seed Admin
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD=admin123
SEED_ADMIN_EMAIL=admin@agentika.com

# CORS
CORS_ORIGIN=http://localhost:8080
```

---

## Endpoints API

### Auth (`/api/auth`)

| Metodo | Endpoint | Auth | Descripcion |
|--------|----------|------|-------------|
| POST | `/register` | No | Registro de usuario (role=user) |
| POST | `/login` | No | Login general |
| POST | `/admin/login` | No | Login solo para admin/super_admin |
| POST | `/refresh` | No | Refrescar access token |
| GET | `/me` | Bearer | Obtener usuario actual |
| POST | `/change-password` | Bearer | Cambiar contrasena propia |

### Users (`/api/users`)

| Metodo | Endpoint | Roles | Descripcion |
|--------|----------|-------|-------------|
| GET | `/` | admin, super_admin | Listar usuarios (con filtros) |
| GET | `/:id` | Cualquier auth | Ver usuario por ID |
| POST | `/` | super_admin | Crear usuario |
| PATCH | `/:id` | admin, super_admin | Actualizar usuario |
| DELETE | `/:id` | super_admin | Eliminar usuario |
| PATCH | `/:id/toggle` | super_admin | Activar/Desactivar usuario |
| PATCH | `/:id/password` | super_admin | Resetear contrasena |

---

## Seguridad Implementada

1. **Password hashing**: bcrypt con salt 12 rounds
2. **JWT**: Access token (7d) + Refresh token (30d)
3. **Rate limiting**: 10 intentos login / 15 min por IP
4. **Validacion de inputs**: express-validator en register/login
5. **No retorno de passwordHash**: `select: false` + sanitizeUser()
6. **Proteccion ultimo super_admin**: No se puede eliminar/desactivar/descender el ultimo
7. **RBAC**: Middleware `authorizeRoles` para control granular
8. **CORS**: Origen configurado por env var
9. **Helmet**: Headers de seguridad HTTP

---

## Comandos

```bash
# Backend
cd backend
npm run build       # Compilar TypeScript
npx tsx src/index.ts # Desarrollo

# Frontend Admin
cd admin
npm run dev         # Puerto 8080
```

---

## Pruebas Rapidas (PowerShell)

```powershell
# 1. Login admin
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/admin/login" -Method POST -ContentType "application/json" -Body '{"usernameOrEmail":"admin","password":"admin123"}'
$token = $login.data.token

# 2. Validar token (me)
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Headers @{"Authorization"="Bearer $token"}

# 3. Listar usuarios
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Headers @{"Authorization"="Bearer $token"}

# 4. Crear usuario
Invoke-RestMethod -Uri "http://localhost:5000/api/users" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body '{"username":"testuser","email":"test@test.com","password":"Test1234","firstName":"Test","lastName":"User","role":"user"}'
```

---

## Credenciales por Defecto

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `super_admin`

Se crea automaticamente al iniciar el servidor si no existe.
