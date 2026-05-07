# Sistema de Autenticación ADMIN - Backend Agentika

## Estado: ✅ COMPLETADO Y FUNCIONAL

El sistema de autenticación ADMIN ya está completamente implementado y probado en el backend.

## Componentes Implementados

### 1. Modelo de Usuario (`src/models/User.ts`)
- Campos: email, password, firstName, lastName, role, avatar, isActive
- Roles: 'user', 'admin', 'editor'
- Hash de contraseña automático con bcryptjs
- Método `comparePassword()` para validación

### 2. Configuración JWT (`src/config/jwt.ts`)
- Generación de tokens con `generateToken()`
- Verificación de tokens con `verifyToken()`
- Payload incluye: id, email, role

### 3. Middleware de Autenticación (`src/middleware/auth.ts`)
- `authMiddleware`: Verifica token JWT válido
- `adminMiddleware`: Requiere rol de admin
- `optionalAuthMiddleware`: Autenticación opcional

### 4. Controlador de Autenticación (`src/controllers/AuthController.ts`)
- `register()`: Registro de usuarios
- `login()`: Login general
- `adminLogin()`: Login exclusivo para admin
- `getProfile()`: Obtener perfil del usuario
- `updateProfile()`: Actualizar perfil

### 5. Servicio de Autenticación (`src/services/AuthService.ts`)
- Lógica de negocio para autenticación
- Validación de credenciales
- Verificación de rol admin
- Generación de tokens JWT

### 6. Rutas de Autenticación (`src/routes/auth.ts`)
- `POST /api/auth/register`: Registro público
- `POST /api/auth/login`: Login general
- `POST /api/auth/admin/login`: **Login exclusivo admin**
- `GET /api/auth/profile`: Perfil protegido
- `PUT /api/auth/profile`: Actualizar perfil
- `GET /api/auth/admin/me`: **Validación sesión admin**

### 7. Rutas Protegidas
- **Mail routes** (`src/routes/mail.ts`): Protegidas con authMiddleware + adminMiddleware
- Todas las rutas de correo requieren autenticación y rol admin

## Variables de Entorno (`.env`)
```env
JWT_SECRET=clave_super_segura_y_larga_para_agentika_2024
JWT_EXPIRES_IN=7d
```

## Script de Seed para Super Admin
**Ubicación**: `src/scripts/seedSuperAdmin.ts`

**Uso**:
```bash
cd backend
npx tsx src/scripts/seedSuperAdmin.ts
```

**Credenciales por defecto**:
- Email: admin@agentika.com
- Password: demo123
- Role: admin

## Prueba del Sistema

### Login Admin Exitoso
```bash
POST http://localhost:5000/api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@agentika.com",
  "password": "demo123"
}
```

**Respuesta**:
```json
{
  "message": "Admin login successful",
  "data": {
    "user": {
      "_id": "69f27065e16787bb7c3e9253",
      "email": "admin@agentika.com",
      "firstName": "Admin",
      "lastName": "Agentika",
      "role": "admin",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Validación de Sesión Admin
```bash
GET http://localhost:5000/api/auth/admin/me
Authorization: Bearer <TOKEN>
```

### Acceso a Rutas Protegidas (Mail)
```bash
GET http://localhost:5000/api/mail/inbox
Authorization: Bearer <TOKEN>
```

## Seguridad Implementada

1. **Hash de contraseñas**: bcryptjs con salt rounds = 10
2. **Tokens JWT**: Firma con JWT_SECRET, expiración 7 días
3. **Verificación de rol**: adminMiddleware bloquea no-admins
4. **Protección de rutas**: Middleware aplicado a rutas sensibles
5. **Validación de credenciales**: Verificación de email, password y rol

## Flujo de Autenticación Admin

1. Usuario envía credenciales a `/api/auth/admin/login`
2. Backend busca usuario por email
3. Verifica que el rol sea 'admin'
4. Compara contraseña hasheada con bcrypt
5. Genera token JWT con id, email, role
6. Retorna token y datos de usuario
7. Cliente guarda token (localStorage/memory)
8. Cliente envía token en header `Authorization: Bearer <TOKEN>`
9. Middleware verifica token en cada request protegido
10. adminMiddleware verifica rol = 'admin'

## Frontend (React Admin) - Próximos Pasos

### Login
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const { data } = await response.json();
  localStorage.setItem('token', data.token);
};
```

### Protección de Rutas
```typescript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};
```

### Request con Token
```typescript
const fetchWithAuth = async (url: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return response.json();
};
```

## Verificación de Funcionamiento

✅ Backend iniciado correctamente
✅ MongoDB conectado
✅ Usuario admin creado automáticamente
✅ Login admin exitoso
✅ Token JWT generado correctamente
✅ Rutas de correo protegidas con middleware
✅ Sistema listo para integración con frontend

## Conclusión

El sistema de autenticación ADMIN está completamente implementado, probado y listo para usar. Todas las rutas sensibles (como correo) están protegidas con autenticación y verificación de rol admin. El backend está preparado para integrarse con el frontend de React.
