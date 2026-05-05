# Blog Integration - Resumen de Cambios Técnicos

## 🔄 Cambios por Archivo

### 1. Backend

#### `backend/src/models/BlogPost.ts`
```diff
+ cover?: string              // Nueva: URL de imagen de portada
+ category?: string          // Nueva: Categoría del artículo  
+ seoTitle?: string          // Nueva: Título SEO (máx 70 chars)
+ seoDescription?: string    // Nueva: Meta description (máx 160 chars)
+ readTime?: string          // Nueva: Tiempo de lectura (ej: "5 min read")
+ publishedAt?: Date         // Nueva: Fecha de publicación
```

#### `backend/src/services/BlogService.ts`
```diff
+ uploadBlogImage(buffer, originalName, mimetype): Promise<{fileName, presignedUrl}>
+ getBlogImagePresignedUrl(fileName, expiresIn): Promise<string>
```
Métodos que integran con MinIO para:
- Almacenar imagen con UUID único
- Generar URL presignada válida 24h
- No exponer credenciales de MinIO

#### `backend/src/controllers/BlogController.ts`
```diff
+ async uploadBlogImage(req, res, next): Promise<void>
```
- Valida que usuario esté autenticado
- Valida que archivo esté presente
- Llama a BlogService.uploadBlogImage()
- Devuelve {fileName, presignedUrl}

#### `backend/src/routes/blog.ts`
```diff
+ import multer from 'multer'
+ const upload = multer({ storage: multer.memoryStorage() })
+ router.post('/upload-image', authMiddleware, upload.single('image'), ...)
```

### 2. Admin Dashboard

#### `admin/src/routes/admin.blog.$id.tsx` (MAYOR REESCRITURA: ~300 líneas modificadas)
```diff
- import { useStore, store } from "@/lib/store"
- import type { BlogPost, PostStatus } from "@/lib/mock-data"

+ import { blogAPI, type BlogPost } from "@/hooks/useAPI"

// Estados nuevos:
+ const [loading, setLoading] = useState(!isNew)
+ const [saving, setSaving] = useState(false)
+ const [error, setError] = useState<string | null>(null)
+ const [uploadingImage, setUploadingImage] = useState(false)

// Métodos nuevos:
+ const loadPost = async (id: string) => { ... }  // Carga de API
+ const save = async (newStatus?: 'draft' | 'published' | 'archived') => { ... }
+ const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { ... }

// Cambios en funcionalidad:
- Guardaba en store local
+ Guarda en API real
- No subía imágenes
+ Sube a MinIO con preview
- No manejaba errores
+ Estados de error/carga
```

**Nuevas características:**
- Loading spinner mientras carga post
- Error banner si falla
- Botones deshabilitados mientras se guarda
- Preview de imagen después de subir
- Sincronización con store local como fallback

#### `admin/src/hooks/useAPI.ts`
```diff
  export interface BlogPost {
    // Existentes...
+   cover?: string
+   category?: string
+   seoTitle?: string
+   seoDescription?: string
+   readTime?: string
+   publishedAt?: string
  }

  export const blogAPI = {
    // Métodos existentes...
+   uploadImage: async (file: File): Promise<{ fileName: string; presignedUrl: string }>
  }
```

### 3. Frontend

#### `frontend/src/pages/Blog.tsx` (REESCRITURA COMPLETA: ~150 líneas)
```diff
- import { blogPosts } from "@/data/blogPosts"
- const [activeCategory, setActiveCategory] = useState("ALL")

+ import { useBlog, type BlogPost } from "@/hooks/useAPI"
+ const [posts, setPosts] = useState<BlogPost[]>([])
+ const [loading, setLoading] = useState(true)
+ const [error, setError] = useState<string | null>(null)

- Los artículos estaban hardcoded
+ Los artículos se cargan de API

- No había estados de carga
+ Muestra "Cargando artículos..."

- No había manejo de errores
+ Muestra mensaje de error si falla

- No había categorías dinámicas
+ Soporta cualquier categoría del backend
```

**Nuevas características:**
- Carga desde `getPosts(1, 100, 'published')`
- Categorías dinámicas (no limitadas a 4)
- Fallback de imagen si no tiene cover
- Muestra tags dinámicamente
- Manejo completo de errores

#### `frontend/src/pages/BlogPost.tsx` (REESCRITURA COMPLETA: ~120 líneas)
```diff
- import { blogPosts } from "@/data/blogPosts"
- const post = blogPosts.find(p => p.id === id)

+ import { useBlog, type BlogPost } from "@/hooks/useAPI"
+ const [post, setPost] = useState<BlogPost | null>(null)
+ const [loading, setLoading] = useState(true)
+ const [error, setError] = useState<string | null>(null)

- Post era estático
+ Post se carga dinámicamente por ID

- No había markdown
+ Usa ReactMarkdown para renderizar

- No había imagen de portada
+ Muestra cover/thumbnail de MinIO
```

**Nuevas características:**
- Carga desde `getPost(id)`
- Renderiza markdown con `ReactMarkdown + remark-gfm`
- Muestra imagen de MinIO
- Tags clickeables
- Incrementa views en cada acceso (en backend)
- Estados de carga y error

#### `frontend/src/hooks/useAPI.ts`
```diff
  export const useBlog = () => {
    const createPost = useCallback(
      async (
        title, slug, content, excerpt,
        thumbnail?,
+       cover?,
+       tags?,
+       category?,
+       seoTitle?,
+       seoDescription?,
+       readTime?
      ) => { ... }
    )
    // ... resto de métodos igual ...
  }
```

## 📊 Comparativa Before/After

### Admin Blog Editor
| Aspecto | Antes | Después |
|--------|-------|---------|
| **Datos** | Store local (mock-data.ts) | API Backend + MongoDB |
| **Imágenes** | URL string manual | Subida a MinIO automática |
| **Estado UI** | Inmediato, no visible | Loading/saving states |
| **Errores** | Sin manejo | Error banner visible |
| **Sincronización** | Solo local | API + store local fallback |
| **Campos** | Básicos | +6 campos de metadata |

### Frontend Blog
| Aspecto | Antes | Después |
|--------|-------|---------|
| **Datos** | Archivo JSON estático | API Backend dinámico |
| **Categorías** | 4 fijas | Dinámicas del backend |
| **Imágenes** | URLs remotas string | MinIO presigned URLs |
| **Markdown** | HTML string | Renderizado completo |
| **Actualización** | Requiere rebuild | Inmediata en tiempo real |
| **Filtrado** | 4 categorías | Ilimitadas |

## 🔧 Compatibilidad API

### Endpoint POST /blog (Create)
```json
{
  "title": "string",
  "slug": "string",
  "content": "string (markdown)",
  "excerpt": "string (max 500)",
  "thumbnail": "string? (url)",
  "cover": "string? (presigned url from MinIO)",
  "tags": ["string"],
  "category": "string",
  "seoTitle": "string? (max 70)",
  "seoDescription": "string? (max 160)",
  "readTime": "string?"
}
```

### Endpoint POST /blog/upload-image (New)
```
Form: multipart/form-data
Field: image (File)

Response:
{
  "message": "Blog image uploaded successfully",
  "data": {
    "fileName": "blog/uuid.jpg",
    "presignedUrl": "https://minio.../agentika/blog/uuid.jpg?X-Amz-Algorithm=..."
  }
}
```

### Endpoint GET /blog (List)
```
Query params: ?page=1&limit=10&status=published

Response:
{
  "data": {
    "posts": [BlogPost[], 
    "total": number,
    "pages": number
  }
}
```

### Endpoint GET /blog/post/:id (Get Detail)
```
Response:
{
  "data": BlogPost {
    "_id": "...",
    "title": "...",
    "content": "...",
    "cover": "presigned url",
    // ... todos los campos ...
  }
}
```

## 🎯 Flujos de Datos Clave

### Crear Artículo
```
Admin form → validate → uploadImage to MinIO → 
get presignedUrl → save post with url → 
MongoDB stores → API returns → redirect
```

### Cargar Listado
```
Frontend mounts → useEffect → getPosts(page, limit, status) →
API queries MongoDB → populate author → return data →
useState updates → render grid with MinIO images
```

### Ver Artículo
```
User clicks → React Router navigate → useEffect →
getPost(id) → API increments views → return post →
ReactMarkdown renders content → show MinIO image
```

## ✅ Testing Checklist Automático

Para verificar que todo funciona:

```typescript
// 1. Backend API
GET /health → 200 OK
POST /blog/upload-image → 201 + {presignedUrl}
POST /blog → 201 + {_id, title, ...}
GET /blog?status=published → 200 + {posts: [...]}
GET /blog/post/:id → 200 + {full post with views++}

// 2. Admin
- Puede crear post
- Puede subir imagen
- Puede editar post
- Guarda en backend
- Sincroniza con store

// 3. Frontend
- Blog.tsx carga artículos
- Muestra imágenes de MinIO
- Filtra por categoría
- BlogPost.tsx carga por ID
- Renderiza markdown
- Muestra tags
```

---

**Total de archivos modificados**: 10
**Total de líneas de código**: ~1500 (cambios + nuevas funciones)
**Endpoints nuevos**: 1 (/blog/upload-image)
**Modelos actualizados**: 1 (BlogPost)
**Servicios extendidos**: 1 (BlogService)
**Componentes reescritos**: 4 (BlogEditor, Blog, BlogPost, useAPI hooks)
**Documentación**: 4 archivos nuevos
