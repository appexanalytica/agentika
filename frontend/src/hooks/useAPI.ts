// hooks/useAPI.ts - Frontend API Integration

import axios, { AxiosInstance } from 'axios';
import { useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author?: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  thumbnail?: string;
  cover?: string;
  tags: string[];
  category?: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Hook de autenticación
export const useAuth = () => {
  const register = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
      });
      localStorage.setItem('auth_token', response.data.data.token);
      return response.data.data;
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.data.data.token);
    return response.data.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
  }, []);

  const getProfile = useCallback(async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data.data;
  }, []);

  const updateProfile = useCallback(
    async (firstName: string, lastName: string, avatar?: string) => {
      const response = await apiClient.put('/auth/profile', {
        firstName,
        lastName,
        avatar,
      });
      return response.data.data;
    },
    []
  );

  return { register, login, logout, getProfile, updateProfile };
};

// Hook de archivos
export const useFiles = () => {
  const uploadFile = useCallback(async (file: File, tags?: string[]) => {
    const formData = new FormData();
    formData.append('file', file);
    if (tags) {
      formData.append('tags', tags.join(','));
    }

    const response = await apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  }, []);

  const downloadFile = useCallback(async (fileId: string) => {
    const response = await apiClient.get(`/files/download/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  }, []);

  const deleteFile = useCallback(async (fileId: string) => {
    return await apiClient.delete(`/files/${fileId}`);
  }, []);

  const listUserFiles = useCallback(async () => {
    const response = await apiClient.get('/files/my-files');
    return response.data.data;
  }, []);

  const getPresignedUrl = useCallback(async (fileId: string, expiresIn?: number) => {
    const response = await apiClient.get(`/files/presigned-url/${fileId}`, {
      params: { expiresIn },
    });
    return response.data.data.url;
  }, []);

  return { uploadFile, downloadFile, deleteFile, listUserFiles, getPresignedUrl };
};

// Hook de blog
export const useBlog = () => {
  const createPost = useCallback(
    async (
      title: string,
      slug: string,
      content: string,
      excerpt: string,
      thumbnail?: string,
      cover?: string,
      tags?: string[],
      category?: string,
      seoTitle?: string,
      seoDescription?: string,
      readTime?: string
    ) => {
      const response = await apiClient.post('/blog', {
        title,
        slug,
        content,
        excerpt,
        thumbnail,
        cover,
        tags: Array.isArray(tags) ? tags : tags?.split(',').map(t => t.trim()),
        category,
        seoTitle,
        seoDescription,
        readTime,
      });
      return response.data.data;
    },
    []
  );

  const getPosts = useCallback(async (page = 1, limit = 10, status = 'published') => {
    const response = await apiClient.get('/blog', {
      params: { page, limit, status },
    });
    return response.data.data;
  }, []);

  const getPost = useCallback(async (postId: string) => {
    const response = await apiClient.get(`/blog/post/${postId}`);
    return response.data.data;
  }, []);

  const updatePost = useCallback(
    async (postId: string, data: Record<string, any>) => {
      const response = await apiClient.put(`/blog/${postId}`, data);
      return response.data.data;
    },
    []
  );

  const deletePost = useCallback(async (postId: string) => {
    return await apiClient.delete(`/blog/${postId}`);
  }, []);

  const likePost = useCallback(async (postId: string) => {
    const response = await apiClient.post(`/blog/${postId}/like`);
    return response.data.data;
  }, []);

  const searchPosts = useCallback(async (query: string) => {
    const response = await apiClient.get('/blog/search', {
      params: { query },
    });
    return response.data.data;
  }, []);

  const getPostsByTag = useCallback(async (tag: string) => {
    const response = await apiClient.get(`/blog/tag/${tag}`);
    return response.data.data;
  }, []);

  return {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    likePost,
    searchPosts,
    getPostsByTag,
  };
};

export default apiClient;
