# Quick Start Guide

## Opción 1: Desarrollo Local (Recomendado)

### Requisitos
- Node.js v16+
- MongoDB local o atlas (https://www.mongodb.com/cloud/atlas)
- MinIO local o S3 AWS

### Instalación

1. **Instalar dependencias**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

3. **Editar `.env`** con tus credenciales:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/agentika
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

---

## Opción 2: Docker Compose (Todo incluido)

### Requisitos
- Docker Desktop

### Pasos

1. **Desde la carpeta backend**
```bash
docker-compose up -d
```

Esto iniciará:
- MongoDB en puerto 27017
- MinIO en puerto 9000 (Admin: http://localhost:9001)
- Backend en puerto 5000

2. **Verificar servicios**
```bash
# Health check
curl http://localhost:5000/health

# MongoDB
mongosh --username root --password root --authenticationDatabase admin localhost:27017

# MinIO Web UI
http://localhost:9001 (minioadmin / minioadmin)
```

3. **Detener servicios**
```bash
docker-compose down
```

---

## Opción 3: Production Deploy

### Build y Run

```bash
# Build
npm run build

# Start
npm start
```

---

## Testing

### Ejecutar script de pruebas
```bash
bash test-api.sh
```

### Usar Postman o Insomnia
Importar ejemplos desde `API.md`

### cURL manual
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'
```

---

## Estructura de carpetas

```
backend/
├── src/
│   ├── config/          # Configuración DB, JWT, MinIO
│   ├── controllers/     # Lógica de rutas
│   ├── middleware/      # Auth, validación, errors
│   ├── models/          # Esquemas MongoDB
│   ├── routes/          # Endpoints API
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Funciones auxiliares
│   └── index.ts         # Entry point
├── dist/                # Código compilado
├── .env.example         # Template env
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── Dockerfile
├── API.md               # Documentación API
└── test-api.sh          # Script de testing
```

---

## Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| PORT | 5000 | Puerto del servidor |
| NODE_ENV | development | Ambiente (dev/prod) |
| MONGODB_URI | mongodb://localhost:27017/agentika | URL MongoDB |
| MINIO_ENDPOINT | localhost | Host MinIO |
| MINIO_PORT | 9000 | Puerto MinIO |
| MINIO_ACCESS_KEY | minioadmin | Usuario MinIO |
| MINIO_SECRET_KEY | minioadmin | Contraseña MinIO |
| JWT_SECRET | secret-key | Clave JWT (cambiar en prod) |
| JWT_EXPIRE | 7d | Expiración token |
| CORS_ORIGIN | http://localhost:3000 | Orígenes CORS permitidos |

---

## Endpoints Principales

### Auth
- POST `/api/auth/register` - Registrar usuario
- POST `/api/auth/login` - Iniciar sesión
- GET `/api/auth/profile` - Obtener perfil (protected)
- PUT `/api/auth/profile` - Actualizar perfil (protected)

### Files (MinIO)
- POST `/api/files/upload` - Subir archivo
- GET `/api/files/download/:fileId` - Descargar archivo
- DELETE `/api/files/:fileId` - Eliminar archivo
- GET `/api/files/my-files` - Listar archivos del usuario
- GET `/api/files/presigned-url/:fileId` - URL firmada

### Blog
- POST `/api/blog` - Crear post
- GET `/api/blog` - Listar posts
- GET `/api/blog/post/:postId` - Obtener post
- PUT `/api/blog/:postId` - Editar post
- DELETE `/api/blog/:postId` - Eliminar post
- GET `/api/blog/search?query=...` - Buscar posts
- POST `/api/blog/:postId/like` - Like a post

---

## Troubleshooting

### Error: MongoDB Connection Failed
```bash
# Verificar MongoDB está corriendo
mongosh

# O iniciar con Docker
docker run -d -p 27017:27017 mongo
```

### Error: MinIO Connection Failed
```bash
# Verificar MinIO está corriendo
curl http://localhost:9000/minio/health/live

# O iniciar con Docker
docker run -d -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address ":9001"
```

### Error: Port already in use
```bash
# Cambiar puerto en .env o usar:
lsof -i :5000  # Find process
kill -9 <PID>  # Kill process
```

---

## Performance Tips

1. Habilitar caching de MongoDB
2. Usar índices en búsquedas frecuentes
3. Implementar rate limiting en producción
4. Usar CDN para archivos en MinIO
5. Monitorear con tools como New Relic

---

## Seguridad

- ✅ Contraseñas hasheadas con bcryptjs
- ✅ Tokens JWT con expiración
- ✅ Validación de entrada
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting (implementar)
- ✅ SQL Injection prevención (usando Mongoose)

---

## Próximos pasos

1. Conectar frontend con los endpoints
2. Implementar refresh tokens
3. Agregar rate limiting
4. Implementar logging avanzado
5. Setup CI/CD (GitHub Actions)
6. Monitoreo en producción
