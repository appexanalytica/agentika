# Agentika Backend

Backend API para Agentika con Node.js, Express, MongoDB y MinIO.

## Características

- 🚀 Express.js API REST
- 🗄️ MongoDB para base de datos
- 📦 MinIO para almacenamiento de archivos (buckets)
- 🔐 Autenticación con JWT
- 🛡️ Seguridad con Helmet y CORS
- 📝 Validación de datos con express-validator
- 📊 Logging con Morgan

## Requisitos previos

- Node.js v16+
- npm o yarn
- MongoDB local o remoto
- MinIO local o remoto

## Instalación

1. Clonar el repositorio
```bash
cd backend
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

4. Editar `.env` con tus credenciales

## Desarrollo

Iniciar servidor en modo desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

## Build

Compilar TypeScript a JavaScript:
```bash
npm run build
npm start
```

## Estructura del proyecto

```
backend/
├── src/
│   ├── config/           # Configuración (MongoDB, MinIO)
│   ├── controllers/      # Controladores de rutas
│   ├── middleware/       # Middlewares (auth, validación)
│   ├── models/           # Esquemas de MongoDB
│   ├── routes/           # Rutas de API
│   ├── services/         # Lógica de negocio
│   ├── utils/            # Funciones auxiliares
│   └── index.ts          # Punto de entrada
├── dist/                 # Código compilado
├── .env.example          # Variables de entorno de ejemplo
├── package.json
└── tsconfig.json
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Usuarios
- `GET /api/users` - Obtener usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario

### Archivos (MinIO)
- `POST /api/files/upload` - Subir archivo
- `GET /api/files/:id` - Descargar archivo
- `DELETE /api/files/:id` - Eliminar archivo

### Blog
- `GET /api/blog` - Obtener posts
- `POST /api/blog` - Crear post
- `PUT /api/blog/:id` - Actualizar post
- `DELETE /api/blog/:id` - Eliminar post

## Configuración de MinIO

MinIO corre en `http://localhost:9000` con interfaz web en `http://localhost:9001`

Credenciales por defecto:
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

## Testing

Para probar la API puedes usar Postman, Insomnia o curl.

Ejemplo:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Licencia

MIT
