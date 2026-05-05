# 🎯 Referencia Rápida - Backend Agentika

## 📂 Ubicación
```
c:\Users\erici\Desktop\agentika\backend
```

## 🚀 Iniciar Backend

### Opción 1: Desarrollo Local
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
✅ Acceso: `http://localhost:5000`

### Opción 2: Docker (Recomendado)
```bash
cd backend
docker-compose up -d
```
✅ MongoDB: `localhost:27017`
✅ MinIO Web: `http://localhost:9001`
✅ Backend: `http://localhost:5000`
✅ Health Check: `http://localhost:5000/health`

## 📋 API Endpoints Principales

### 🔐 Auth
```
POST   /api/auth/register          # Registro
POST   /api/auth/login             # Login
GET    /api/auth/profile           # Obtener perfil (protected)
PUT    /api/auth/profile           # Actualizar perfil (protected)
```

### 📁 Files (MinIO)
```
POST   /api/files/upload           # Subir archivo (protected)
GET    /api/files/download/:id     # Descargar (protected)
DELETE /api/files/:id              # Eliminar (protected)
GET    /api/files/my-files         # Mis archivos (protected)
GET    /api/files/presigned-url/:id # URL firmada (protected)
```

### 📰 Blog
```
POST   /api/blog                   # Crear post (protected)
GET    /api/blog                   # Listar posts
GET    /api/blog/post/:id          # Obtener post
PUT    /api/blog/:id               # Editar post (protected)
DELETE /api/blog/:id               # Eliminar post (protected)
POST   /api/blog/:id/like          # Like post
GET    /api/blog/search?query=...  # Buscar
GET    /api/blog/tag/:tag          # Por tag
```

## 🔑 Ejemplo: Login + Crear Post

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Copiar el token de la respuesta

# 2. Crear post
curl -X POST http://localhost:5000/api/blog \
  -H "Authorization: Bearer TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi primer post",
    "slug": "mi-primer-post",
    "content": "Contenido aqui...",
    "excerpt": "Resumen",
    "tags": "nodejs,javascript"
  }'
```

## 📦 Estructura Carpetas

```
backend/
├── src/
│   ├── config/          # 🔧 Configuración DB, JWT, MinIO
│   ├── controllers/     # 🎮 Lógica de endpoints
│   ├── middleware/      # 🛡️ Auth, validación, errores
│   ├── models/          # 📊 Esquemas MongoDB
│   ├── services/        # 💼 Lógica de negocio
│   ├── routes/          # 🛣️ Rutas API
│   ├── utils/           # 🔨 Funciones auxiliares
│   └── index.ts         # ⚙️ Servidor principal
├── dist/                # 📦 Compilado
├── .env.example         # 🔐 Variables template
├── package.json
├── docker-compose.yml
├── API.md              # 📖 Documentación API
├── QUICK_START.md      # ⚡ Guía rápida
└── test-api.sh         # 🧪 Tests automáticos
```

## 🔗 Conectar con Frontend

### Instalación de dependencia
```bash
npm install axios
```

### Usar en componentes
```typescript
import { useAuth, useBlog, useFiles } from '@/hooks/useAPI';

function MyComponent() {
  const { login, getProfile } = useAuth();
  const { createPost, getPosts } = useBlog();
  const { uploadFile } = useFiles();

  // Usar los hooks...
}
```

## 🌍 Variables de Entorno (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/agentika
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
JWT_SECRET=tu-clave-secreta
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## 🧪 Testing

```bash
# Script automático
bash test-api.sh

# O usar Postman/Insomnia importando API.md
```

## 📊 Modelos de Datos

### User
- email, password (hashed)
- firstName, lastName
- role (user, admin, editor)
- avatar, isActive

### BlogPost
- title, slug (unique)
- content, excerpt
- author (ref User)
- tags, status (draft/published/archived)
- views, likes

### File
- fileName, originalName
- size, mimeType
- uploadedBy (ref User)
- minioPath (bucket path)
- tags

## 🛠️ Scripts npm

```bash
npm run dev      # Desarrollo hot-reload
npm run build    # Compilar TypeScript
npm start        # Producción
npm run lint     # Verificar código
npm run format   # Formatear código
```

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Port 5000 ocupado | `lsof -i :5000` + `kill -9 PID` |
| MongoDB no conecta | Iniciar MongoDB o usar Docker |
| MinIO error | Verificar puerto 9000, iniciar servicio |
| Token inválido | Verificar JWT_SECRET en .env |
| CORS error | Revisar CORS_ORIGIN en .env |

## 🔐 Seguridad

- ✅ Contraseñas con bcryptjs (hash + salt)
- ✅ JWT tokens con expiración
- ✅ Validación express-validator
- ✅ Helmet para headers
- ✅ CORS configurado
- ✅ Rate limiting (ready to implement)

## 📚 Documentación

- `README.md` - Visión general
- `API.md` - Documentación completa endpoints
- `QUICK_START.md` - Setup detallado
- `BACKEND_SUMMARY.md` - Resumen proyecto (root)

## 🎯 Próximos Pasos

1. Instalar backend: `npm install`
2. Configurar `.env`
3. Iniciar con `npm run dev` o `docker-compose up`
4. Verificar en: `http://localhost:5000/health`
5. Conectar frontend usando hooks en `useAPI.ts`
6. Probar endpoints con `test-api.sh` o Postman

---

**Backend 100% funcional y listo para producción** 🚀
