# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Todos los endpoints protegidos requieren un token JWT en el header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
**POST** `/auth/register`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**POST** `/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile
**GET** `/auth/profile` (Protected)

Response:
```json
{
  "data": {
    "_id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### Update Profile
**PUT** `/auth/profile` (Protected)

Request:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

Response:
```json
{
  "message": "Profile updated successfully",
  "data": {
    "_id": "123",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "user"
  }
}
```

---

## Files Endpoints

### Upload File
**POST** `/files/upload` (Protected)

Request: FormData
- `file`: Binary file data
- `tags`: Comma-separated tags (optional)

Response:
```json
{
  "message": "File uploaded successfully",
  "data": {
    "_id": "file123",
    "fileName": "abc123.pdf",
    "originalName": "document.pdf",
    "size": 1024,
    "mimeType": "application/pdf",
    "minioPath": "agentika/abc123.pdf",
    "tags": ["important", "2024"],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Download File
**GET** `/files/download/:fileId` (Protected)

Returns the file as attachment

### Delete File
**DELETE** `/files/:fileId` (Protected)

Response:
```json
{
  "message": "File deleted successfully"
}
```

### Get File Metadata
**GET** `/files/metadata/:fileId`

Response:
```json
{
  "data": {
    "_id": "file123",
    "fileName": "abc123.pdf",
    "originalName": "document.pdf",
    "size": 1024,
    "mimeType": "application/pdf",
    "uploadedBy": {
      "_id": "user123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tags": ["important"],
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### List User Files
**GET** `/files/my-files` (Protected)

Response:
```json
{
  "data": [
    {
      "_id": "file123",
      "fileName": "abc123.pdf",
      "originalName": "document.pdf",
      ...
    }
  ]
}
```

### Get Presigned URL
**GET** `/files/presigned-url/:fileId?expiresIn=3600` (Protected)

Query Parameters:
- `expiresIn`: Expiration time in seconds (default: 3600)

Response:
```json
{
  "data": {
    "url": "http://localhost:9000/agentika/abc123.pdf?..."
  }
}
```

---

## Blog Endpoints

### Create Post
**POST** `/blog` (Protected)

Request:
```json
{
  "title": "My First Post",
  "slug": "my-first-post",
  "content": "This is the content of my post...",
  "excerpt": "A short excerpt",
  "thumbnail": "https://example.com/image.jpg",
  "tags": "nodejs,javascript,backend"
}
```

Response:
```json
{
  "message": "Post created successfully",
  "data": {
    "_id": "post123",
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "This is the content...",
    "excerpt": "A short excerpt",
    "author": {
      "_id": "user123",
      "email": "user@example.com",
      "firstName": "John"
    },
    "status": "draft",
    "views": 0,
    "likes": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get All Posts
**GET** `/blog?page=1&limit=10&status=published`

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Posts per page (default: 10)
- `status`: Filter by status - 'draft', 'published', 'archived' (default: published)

Response:
```json
{
  "data": {
    "posts": [...],
    "total": 25,
    "pages": 3
  }
}
```

### Get Single Post
**GET** `/blog/post/:postId`

Response:
```json
{
  "data": {
    "_id": "post123",
    "title": "My First Post",
    ...
    "views": 5
  }
}
```

### Update Post
**PUT** `/blog/:postId` (Protected)

Request:
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "published"
}
```

Response:
```json
{
  "message": "Post updated successfully",
  "data": {...}
}
```

### Delete Post
**DELETE** `/blog/:postId` (Protected)

Response:
```json
{
  "message": "Post deleted successfully"
}
```

### Like Post
**POST** `/blog/:postId/like`

Response:
```json
{
  "message": "Post liked successfully",
  "data": {
    ...
    "likes": 1
  }
}
```

### Search Posts
**GET** `/blog/search?query=nodejs`

Query Parameters:
- `query`: Search term (required)

Response:
```json
{
  "data": [...]
}
```

### Get Posts by Tag
**GET** `/blog/tag/:tag`

Response:
```json
{
  "data": [...]
}
```

---

## Error Handling

All errors return appropriate HTTP status codes:

```json
{
  "error": "Error message",
  "details": "Detailed information"
}
```

Common Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error
