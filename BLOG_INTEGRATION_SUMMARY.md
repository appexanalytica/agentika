# Integración Blog Admin ↔ Frontend - Resumen Técnico

## ✅ Cambios Realizados

### 1. Backend - Modelo BlogPost Actualizado
**Archivo:** `backend/src/models/BlogPost.ts`

Campos agregados:
- `cover?: string` - URL de imagen de portada
- `category?: string` - Categoría del artículo
- `seoTitle?: string` - Título SEO (máx. 70 caracteres)
- `seoDescription?: string` - Descripción SEO (máx. 160 caracteres)
- `readTime?: string` - Tiempo de lectura
- `publishedAt?: Date` - Fecha de publicación

### 2. Backend - BlogService con Soporte de Imágenes MinIO
**Archivo:** `backend/src/services/BlogService.ts`

Métodos nuevos:
- `uploadBlogImage()` - Sube imagen a MinIO y devuelve URL presignada (24 horas válida)
- `getBlogImagePresignedUrl()` - Genera URL presignada para imagen existente

Interfaces actualizadas:
- `CreateBlogPostInput` - Incluye nuevos campos
- `UpdateBlogPostInput` - Incluye nuevos campos

### 3. Backend - BlogController Mejorado
**Archivo:** `backend/src/controllers/BlogController.ts`

- Validaciones actualizadas para nuevos campos
- Método `uploadBlogImage()` para subida de imágenes
- Soporte para arrays de tags

### 4. Backend - Rutas Blog con Endpoint de Imágenes
**Archivo:** `backend/src/routes/blog.ts`

Nuevo endpoint:
- `POST /blog/upload-image` - Sube imagen a MinIO (requiere autenticación)
  - Forma: `multipart/form-data` con campo `image`
  - Respuesta: `{ fileName, presignedUrl }`

### 5. Admin - BlogEditor Conectado a API Real
**Archivo:** `admin/src/routes/admin.blog.$id.tsx`

Cambios:
- Migrado de store local a API real
- Soporta crear nuevos artículos
- Soporta editar artículos existentes
- Carga artículos del backend por ID
- Subida de imágenes a MinIO con preview
- Estados de carga y error
- Sincroniza con store local como fallback

Funcionalidad:
```typescript
// Nuevo artículo
<BlogEditor newPost />

// Editar artículo existente
<BlogEditor postId={id} />

// Guardar automáticamente sincroniza con backend y store local
await blogAPI.createPost(payload)
```

### 6. Admin - useAPI Hook Actualizado
**Archivo:** `admin/src/hooks/useAPI.ts`

Interfaz `BlogPost` actualizada con:
- `cover?: string`
- `category?: string`
- `seoTitle?: string`
- `seoDescription?: string`
- `readTime?: string`
- `publishedAt?: string`

Método agregado:
- `blogAPI.uploadImage(file)` - Sube imagen a MinIO

### 7. Frontend - Blog.tsx Conectado a API
**Archivo:** `frontend/src/pages/Blog.tsx`

Cambios:
- Carga artículos publicados desde el backend
- Mantiene filtrado por categoría
- Soporta categorías dinámicas
- Estados de carga y error
- Preview de imágenes con fallback

### 8. Frontend - BlogPost.tsx Conectado a API
**Archivo:** `frontend/src/pages/BlogPost.tsx`

Cambios:
- Carga artículo completo desde backend por ID
- Renderiza contenido markdown
- Muestra imágenes (cover/thumbnail)
- Muestra tags como enlaces
- Estados de carga y error

### 9. Frontend - useAPI Hook Actualizado
**Archivo:** `frontend/src/hooks/useAPI.ts`

- Hook `useBlog()` con soporte para todos los campos
- Interfaz `BlogPost` completa
- Métodos: createPost, getPosts, getPost, updatePost, deletePost, likePost, searchPosts, getPostsByTag

## 🔄 Flujo de Integración

### Crear Artículo en Admin
```
1. Admin entra a /admin/blog/new
2. Rellena título, contenido, tags, categoría, etc.
3. Sube imagen de portada → se carga a MinIO
4. Click "Publicar" → se envía a API
5. API crea documento en MongoDB con URL presignada de MinIO
6. Admin se redirige a /admin/blog
7. Artículo aparece inmediatamente en /blog del frontend
```

### Visualizar en Frontend
```
1. Usuario va a /blog
2. Frontend carga artículos publicados de API
3. Se muestran con imagen, categoría, tags
4. Usuario hace click → /blog/:id
5. Frontend carga artículo completo
6. Renderiza markdown y muestra imagen de MinIO
```

### Subida de Imágenes a MinIO
```
Admin editor → File input → uploadBlogImage()
                ↓
           FormData + file
                ↓
         POST /blog/upload-image
                ↓
         MinIO almacena imagen
                ↓
         Genera presigned URL (24h)
                ↓
         Devuelve URL al admin
                ↓
       Admin guarda URL en "cover"
```

## 📋 Checklist de Prueba

- [ ] Backend corriendo en http://localhost:5000
- [ ] MongoDB conectada
- [ ] MinIO corriendo (docker-compose up -d)
- [ ] Admin en http://localhost:5173
- [ ] Frontend en http://localhost:3000

### Admin Panel
- [ ] Crear nuevo artículo
- [ ] Llenar todos los campos (título, contenido, categoría, tags, SEO)
- [ ] Subir imagen de portada
- [ ] Guardar como borrador
- [ ] Editar artículo existente
- [ ] Publicar artículo
- [ ] Comprobar que aparece en /blog

### Frontend Blog
- [ ] Ver listado de artículos
- [ ] Filtrar por categoría
- [ ] Ver información del artículo (autor, fecha, tiempo lectura)
- [ ] Hacer click en artículo
- [ ] Ver contenido markdown renderizado
- [ ] Ver imagen de portada
- [ ] Ver tags
- [ ] Verificar que la imagen viene de MinIO (check headers)

## 🔧 Variables de Entorno Necesarias

**Backend (.env)**
```
API_PORT=5000
MONGODB_URI=mongodb://localhost:27017/agentika
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=agentika
JWT_SECRET=your-jwt-secret
```

**Admin (.env.local)**
```
VITE_API_URL=http://localhost:5000/api
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Próximas Mejoras Opcionales

1. Paginación mejorada en el frontend
2. Búsqueda de artículos en el frontend
3. Like/contador de vistas en tiempo real
4. Comentarios en artículos
5. Recomendaciones de artículos relacionados
6. Optimización de imágenes (WEBP, responsive images)
7. Caché de artículos en frontend

## 📝 Notas Importantes

- Las imágenes se almacenan en MinIO con URL presignada válida 24 horas
- El contenido soporta Markdown completo (tablas, código, etc.)
- El admin y frontend comparten la misma API
- Los artículos sin publicar solo son visibles en el admin
- Los cambios en el admin se reflejan inmediatamente en el frontend
- Las categorías son dinámicas y pueden agregarse nuevas en cualquier momento
