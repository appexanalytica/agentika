# Quick Start - Blog Integration Testing

## ✅ Pre-requisitos

```bash
# 1. Backend running
cd backend
npm install  # si es necesario
npm run dev  # http://localhost:5000

# 2. MongoDB + MinIO (Docker)
docker-compose up -d

# 3. Admin Panel
cd admin
npm install  # si es necesario
npm run dev  # http://localhost:5173

# 4. Frontend
cd frontend
npm install  # si es necesario
npm run dev  # http://localhost:3000 (o PORT 5173)
```

## 🧪 Test Scenario 1: Create Article with Image

### Steps
1. Go to http://localhost:5173 (Admin)
2. Navigate to "/admin/blog"
3. Click "Nuevo artículo"
4. Fill form:
   - Title: "Mi Primer Artículo Integrado"
   - Content: 
     ```markdown
     # Introducción
     Este es un artículo de prueba con **markdown**.
     
     ## Características
     - Soporta tablas
     - Código destacado
     - Listas
     ```
   - Excerpt: "Descripción corta del artículo"
   - Category: "Tutoriales"
   - Tags: "test", "integración"
   - SEO Title: "Mi Primer Artículo - AGENTIKA"
   - SEO Description: "Artículo de prueba de la integración blog"

5. Click image icon or "Subir imagen a MinIO"
6. Select an image
7. Wait for upload (should show preview)
8. Click "Publicar"
9. Should redirect to /admin/blog

### Expected Results
- ✅ Image uploaded to MinIO
- ✅ Article saved to MongoDB
- ✅ No errors in console
- ✅ Redirected to admin blog list

## 🌐 Test Scenario 2: View Article in Frontend

### Steps
1. Go to http://localhost:3000
2. Navigate to "/blog"
3. Should see article in grid
4. Click on article

### Expected Results
- ✅ Blog list loads (may take 2-3 seconds first time)
- ✅ Article shows with:
   - Image from MinIO
   - Title, excerpt
   - Category badge
   - Author name, date, read time
   - Tags
- ✅ Full article page shows:
   - Complete image
   - Markdown rendered with formatting
   - All meta information
   - Tags as clickable elements

## 🔄 Test Scenario 3: Edit Article

### Steps
1. Go to http://localhost:5173/admin/blog
2. Find your article and click edit
3. Change title to "Artículo Actualizado"
4. Add more content
5. Change category
6. Click "Guardar borrador" or "Publicar"

### Expected Results
- ✅ Article loads from API (not from local store)
- ✅ Changes saved to backend
- ✅ Reflect immediately in frontend (refresh to see)

## 🏷️ Test Scenario 4: Filter by Category

### Steps
1. Go to http://localhost:3000/blog
2. Create 2-3 articles with different categories
3. Click filter buttons

### Expected Results
- ✅ Articles filter correctly by category
- ✅ "ALL" shows all articles
- ✅ Specific category shows only those articles

## 🔍 Test Scenario 5: Search & Tags

### Steps
1. Go to http://localhost:3000/blog/:id
2. Click on a tag
3. Should filter articles by tag (optional, requires additional implementation)

### Expected Results
- ✅ Tag is clickable
- ✅ Navigation or filtering works

## 🐛 Debugging Tips

### Check if backend is running
```bash
curl http://localhost:5000/health
# Should return: { "status": "OK" }
```

### Check MongoDB connection
```bash
# In MongoDB
db.blogposts.find()  # Should show articles
```

### Check MinIO
```bash
# MinIO Console: http://localhost:9001
# Login: minioadmin / minioadmin
# Check "agentika" bucket for images
```

### Check browser console
- Admin: http://localhost:5173 → F12 → Console
- Frontend: http://localhost:3000 → F12 → Console
- Look for errors related to API calls

### Check API response
```bash
# Get all published posts
curl http://localhost:5000/api/blog?status=published

# Get single post
curl http://localhost:5000/api/blog/post/{POST_ID}

# Test image upload (requires auth token)
curl -X POST http://localhost:5000/api/blog/upload-image \
  -H "Authorization: Bearer {TOKEN}" \
  -F "image=@/path/to/image.jpg"
```

## 📋 API Endpoints

### Blog Management
- `POST /api/blog` - Create post (auth required)
- `GET /api/blog?page=1&limit=10&status=published` - List posts
- `GET /api/blog/post/:postId` - Get single post
- `PUT /api/blog/:postId` - Update post (auth required)
- `DELETE /api/blog/:postId` - Delete post (auth required)

### Images
- `POST /api/blog/upload-image` - Upload to MinIO (auth required)

### Discovery
- `GET /api/blog/search?query=term` - Search posts
- `GET /api/blog/tag/:tag` - Get posts by tag
- `POST /api/blog/:postId/like` - Like post

## 🚀 Production Ready Checks

- [ ] Error handling works (try invalid inputs)
- [ ] Loading states work
- [ ] Images load correctly from MinIO
- [ ] Markdown renders properly
- [ ] Categories filter correctly
- [ ] No console errors or warnings
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Performance acceptable (articles load in <2s)
- [ ] SEO fields are correct (check meta tags)

## 📞 Troubleshooting

### Issue: "Error al cargar los artículos"
**Possible causes:**
- Backend not running
- API URL wrong in .env
- CORS issue
- Authentication token expired

**Solution:**
```bash
# Check backend
npm run dev  # in backend folder

# Check API connection
curl http://localhost:5000/api/blog

# Clear localStorage and retry
localStorage.clear()
```

### Issue: Image not uploading
**Possible causes:**
- MinIO not running
- MINIO_BUCKET not configured
- File too large

**Solution:**
```bash
# Check MinIO
docker ps | grep minio
docker logs container_id

# Check bucket
mc ls minio/agentika
```

### Issue: Post not showing in frontend
**Possible causes:**
- Article not published (status = 'draft')
- Frontend cache issue
- API pagination issue

**Solution:**
```bash
# Check article status
db.blogposts.findOne({})  # Check status field

# Refresh frontend
Ctrl+Shift+R  # Hard refresh

# Check pagination
http://localhost:3000/blog?page=1&limit=100
```

## 📚 Additional Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [MinIO Documentation](https://docs.min.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express API Guidelines](https://expressjs.com/)
