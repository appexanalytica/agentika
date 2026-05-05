# Arquitectura Blog Integration - AGENTIKA

## 📐 Diagrama General

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Blog Editor (/admin/blog/new, /admin/blog/:id)         │    │
│  │ - Crear/Editar artículos                               │    │
│  │ - Editor markdown con preview                          │    │
│  │ - Subida de imágenes a MinIO                           │    │
│  │ - Gestión de categorías y tags                         │    │
│  │ - Campos SEO completos                                 │    │
│  └──────────────────────┬──────────────────────────────────┘    │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                          │ useAPI Hook
                          │ POST/PUT/GET
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Blog Routes (/api/blog)                                │    │
│  │ - POST /blog (create post)                             │    │
│  │ - PUT /blog/:id (update post)                          │    │
│  │ - GET /blog (list posts)                               │    │
│  │ - GET /blog/:id (get post detail)                      │    │
│  │ - POST /blog/upload-image (upload to MinIO)            │    │
│  │ - DELETE /blog/:id (delete post)                       │    │
│  │ - POST /blog/:id/like (like post)                      │    │
│  │ - GET /blog/search (search posts)                      │    │
│  │ - GET /blog/tag/:tag (filter by tag)                   │    │
│  └──────────────────────┬──────────────────────────────────┘    │
│  ┌──────────────────────▼──────────────────────────────────┐    │
│  │ BlogController + BlogService                           │    │
│  │ - Validación de datos                                  │    │
│  │ - Lógica de negocio                                    │    │
│  │ - Integración con MinIO                                │    │
│  └──────────────────────┬──────────────────────────────────┘    │
└─────────────────────────┼──────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
    ┌──────────┐   ┌────────────┐   ┌───────────┐
    │ MongoDB  │   │   MinIO    │   │   S3-API  │
    │ BlogPost │   │  Imágenes  │   │           │
    │          │   │  (Presigned│   │ (opcional)│
    │ Almacena │   │   URLs)    │   │           │
    │ metadata │   │            │   │           │
    └──────────┘   └────────────┘   └───────────┘
        ▲
        │
┌──────────────────────────────────────────────────────────────────┐
│                      FRONTEND (Public)                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Blog List (/blog)                                          │  │
│  │ - Carga artículos publicados                              │  │
│  │ - Filtro por categoría                                    │  │
│  │ - Muestra preview con imagen de MinIO                     │  │
│  │ - Meta información (autor, fecha, tiempo lectura)         │  │
│  └─────────────────────┬──────────────────────────────────────┘  │
│  ┌─────────────────────▼──────────────────────────────────────┐  │
│  │ Blog Post Detail (/blog/:id)                               │  │
│  │ - Carga artículo completo por ID                          │  │
│  │ - Renderiza contenido markdown                            │  │
│  │ - Muestra imagen de portada desde MinIO                   │  │
│  │ - Muestra tags con enlaces                                │  │
│  │ - Meta información completa                               │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ useBlog Hook - API Integration                             │  │
│  │ - getPosts(): Carga listado                               │  │
│  │ - getPost(id): Carga artículo                             │  │
│  │ - searchPosts(query): Busca                               │  │
│  │ - getPostsByTag(tag): Filtra por tag                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## 📦 Flujo de Datos

### 1. Crear/Editar Artículo
```
Admin Editor
    │
    ├─ Rellena formulario
    │  ├─ title, content, excerpt
    │  ├─ category, tags
    │  ├─ seoTitle, seoDescription
    │  └─ readTime
    │
    └─ Subir imagen
       └─ handleImageUpload()
          └─ blogAPI.uploadImage(file)
             └─ POST /blog/upload-image (multipart/form-data)
                └─ BlogController.uploadBlogImage()
                   └─ BlogService.uploadBlogImage()
                      └─ minioClient.putObject()
                         └─ Genera presigned URL (24h)
                            └─ Devuelve {fileName, presignedUrl}
                               └─ Actualiza state.cover
                                  └─ Muestra preview

    ├─ Click "Guardar borrador"
    │  └─ save("draft")
    │     └─ blogAPI.createPost/updatePost()
    │        └─ POST/PUT /blog/:id
    │           └─ MongoDB almacena documento
    │              └─ Sincroniza con store local (fallback)
    │                 └─ Redirige a /admin/blog
    │
    └─ Click "Publicar"
       └─ save("published")
          └─ Mismo flujo con status = "published"
             └─ Artículo visible en frontend
```

### 2. Ver Blog (Frontend)
```
Usuario navega a /blog
    │
    ├─ Blog.tsx monta
    │  └─ useEffect → loadPosts()
    │     └─ getPosts(1, 100, 'published')
    │        └─ GET /api/blog?page=1&limit=100&status=published
    │           └─ BlogController.getAllPosts()
    │              └─ MongoDB query: { status: 'published' }
    │                 └─ Populate author info
    │                    └─ Devuelve { posts: [], total, pages }
    │
    └─ Renderiza grid
       ├─ Imagen: post.cover (URL presignada de MinIO)
       ├─ Título: post.title
       ├─ Excerpt: post.excerpt
       ├─ Categoría: post.category
       ├─ Autor: post.author.firstName
       ├─ Fecha: formatDate(post.createdAt)
       ├─ Tiempo lectura: post.readTime
       └─ Tags: post.tags
```

### 3. Ver Artículo Completo
```
Usuario hace click en artículo
    │
    ├─ Navega a /blog/:id
    │  └─ BlogPost.tsx monta
    │     └─ useEffect → loadPost(id)
    │        └─ getPost(id)
    │           └─ GET /api/blog/post/:id
    │              └─ BlogController.getPost()
    │                 └─ Incrementa views ++
    │                    └─ MongoDB query: findByIdAndUpdate({ $inc: { views: 1 } })
    │                       └─ Populate author info
    │                          └─ Devuelve post completo
    │
    └─ Renderiza artículo
       ├─ Imagen: post.cover (URL presignada de MinIO)
       ├─ Título: post.title
       ├─ Contenido: ReactMarkdown(post.content)
       ├─ Tags: Renderiza como enlaces
       └─ Meta: {author, fecha, tiempo lectura}
```

## 🗄️ Estructura de Base de Datos (MongoDB)

### Documento BlogPost
```typescript
{
  _id: ObjectId,
  title: string,              // Único
  slug: string,               // Único, lowercase
  content: string,            // Markdown
  excerpt: string,            // Máx 500 caracteres
  author: ObjectId,           // Referencia a User
  
  // Multimedia
  thumbnail: string,          // URL opcional
  cover: string,              // URL presignada MinIO
  
  // Metadatos
  category: string,           // Default: "General"
  tags: [string],            // Lowercase
  status: 'draft' | 'published' | 'archived',
  
  // SEO
  seoTitle: string,          // Máx 70 caracteres
  seoDescription: string,    // Máx 160 caracteres
  
  // Engagements
  views: number,             // Default: 0
  likes: number,             // Default: 0
  readTime: string,          // Ej: "5 min read"
  
  // Fechas
  publishedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Seguridad

### Autenticación
- JWT tokens en headers: `Authorization: Bearer {token}`
- Token almacenado en `localStorage`
- Interceptor en axios para agregar token automáticamente
- Logout automático si token expira (401)

### Autorización
- Solo usuarios autenticados pueden crear/editar/publicar posts
- Solo autor o admin pueden editar/eliminar posts
- Endpoint validación: `post.author._id === req.user.id || req.user.role === 'admin'`
- Artículos draft solo visibles en admin
- Públicamente solo artículos con status = 'published'

### MinIO
- Imágenes almacenadas con nombres únicos (UUID)
- URLs presignadas válidas 24 horas
- Acceso seguro sin exposición de credenciales
- Organización por carpeta: `blog/{uuid}.{ext}`

## 🚀 Deployment Checklist

- [ ] Variables de entorno configuradas (all 3 apps)
- [ ] MongoDB en replicaset (no standalone para transactions)
- [ ] MinIO configurado y accesible
- [ ] CORS habilitado en backend
- [ ] SSL/HTTPS en producción
- [ ] Backups de MongoDB y MinIO configurados
- [ ] Monitoreo de storage MinIO
- [ ] Rate limiting en API
- [ ] Caché de artículos (opcional, Redis)

## 📊 Métricas & Monitoreo

- Views por artículo (se incrementan en cada acceso)
- Likes por artículo (se pueden agregar desde frontend)
- Tiempo de carga de páginas
- Tamaño de imágenes en MinIO
- Hits de búsqueda
- Distribución de categorías
