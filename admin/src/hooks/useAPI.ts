// hooks/useAPI.ts - Admin Dashboard API Integration

import axios, { AxiosInstance } from 'axios';

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
  (error) => Promise.reject(error)
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

export interface User {
  _id: string;
  id: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'superadmin' | 'admin' | 'user';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: User;
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

export interface FileData {
  _id: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedBy: User;
  minioPath: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  status: 'nuevo' | 'contactado' | 'calificado' | 'propuesta' | 'cerrado' | 'perdido';
  value?: number;
  tags: string[];
  notes: Array<{
    id: string;
    text: string;
    author: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pendiente' | 'en_curso' | 'hecho';
  priority: 'alta' | 'media' | 'baja';
  dueDate: string;
  assignedTo?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Email {
  _id: string;
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html: string;
  date: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';
  read: boolean;
  direction: 'inbound' | 'outbound';
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    contentId?: string;
  }>;
  inReplyTo?: string;
  references?: string[];
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authAPI = {
  register: async (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/register', {
      username,
      email,
      password,
      firstName,
      lastName,
    });
    return res.data.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', {
      username,
      password,
    });
    return res.data.data;
  },

  adminLogin: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/admin/login', {
      username,
      password,
    });
    return res.data.data;
  },

  getMe: async (): Promise<{ token: string; user: User }> => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  getAdminProfile: async (): Promise<AuthResponse> => {
    const res = await apiClient.get('/auth/admin/me');
    return res.data.data;
  },

  getProfile: async (): Promise<User> => {
    const res = await apiClient.get('/auth/profile');
    return res.data.data;
  },

  updateProfile: async (
    firstName: string,
    lastName: string,
    avatar?: string
  ): Promise<User> => {
    const res = await apiClient.put('/auth/profile', {
      firstName,
      lastName,
      avatar,
    });
    return res.data.data;
  },
};

// Blog API
export const blogAPI = {
  createPost: async (post: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    thumbnail?: string;
    cover?: string;
    tags?: string[];
    category?: string;
    seoTitle?: string;
    seoDescription?: string;
    readTime?: string;
  }): Promise<BlogPost> => {
    const res = await apiClient.post('/blog', post);
    return res.data.data;
  },

  getPosts: async (
    page = 1,
    limit = 10,
    status = 'published'
  ): Promise<{ posts: BlogPost[]; total: number; pages: number }> => {
    const res = await apiClient.get('/blog', {
      params: { page, limit, status },
    });
    return res.data.data;
  },

  getPost: async (postId: string): Promise<BlogPost> => {
    const res = await apiClient.get(`/blog/post/${postId}`);
    return res.data.data;
  },

  updatePost: async (postId: string, data: Partial<BlogPost>): Promise<BlogPost> => {
    const res = await apiClient.put(`/blog/${postId}`, data);
    return res.data.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/blog/${postId}`);
  },

  likePost: async (postId: string): Promise<BlogPost> => {
    const res = await apiClient.post(`/blog/${postId}/like`);
    return res.data.data;
  },

  searchPosts: async (query: string): Promise<BlogPost[]> => {
    const res = await apiClient.get('/blog/search', { params: { query } });
    return res.data.data;
  },

  getPostsByTag: async (tag: string): Promise<BlogPost[]> => {
    const res = await apiClient.get(`/blog/tag/${tag}`);
    return res.data.data;
  },

  uploadImage: async (file: File): Promise<{ fileName: string; presignedUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await apiClient.post('/blog/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};

// Files API
export const filesAPI = {
  uploadFile: async (file: File, tags?: string[]): Promise<FileData> => {
    const formData = new FormData();
    formData.append('file', file);
    if (tags?.length) {
      formData.append('tags', tags.join(','));
    }

    const res = await apiClient.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  downloadFile: async (fileId: string): Promise<Blob> => {
    const res = await apiClient.get(`/files/download/${fileId}`, {
      responseType: 'blob',
    });
    return res.data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await apiClient.delete(`/files/${fileId}`);
  },

  getFileMetadata: async (fileId: string): Promise<FileData> => {
    const res = await apiClient.get(`/files/metadata/${fileId}`);
    return res.data.data;
  },

  listUserFiles: async (): Promise<FileData[]> => {
    const res = await apiClient.get('/files/my-files');
    return res.data.data;
  },

  getPresignedUrl: async (fileId: string, expiresIn = 3600): Promise<string> => {
    const res = await apiClient.get(`/files/presigned-url/${fileId}`, {
      params: { expiresIn },
    });
    return res.data.data.url;
  },
};

// Leads API
export const leadsAPI = {
  createLead: async (data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
    source?: string;
  }): Promise<Lead> => {
    const res = await apiClient.post('/leads', data);
    return res.data.data;
  },

  getLeads: async (
    page = 1,
    limit = 10,
    status?: string
  ): Promise<{ leads: Lead[]; total: number; pages: number }> => {
    const res = await apiClient.get('/leads', {
      params: { page, limit, status },
    });
    return res.data.data;
  },

  getLead: async (leadId: string): Promise<Lead> => {
    const res = await apiClient.get(`/leads/${leadId}`);
    return res.data.data;
  },

  updateLead: async (leadId: string, data: Partial<Lead>): Promise<Lead> => {
    const res = await apiClient.put(`/leads/${leadId}`, data);
    return res.data.data;
  },

  updateLeadStatus: async (leadId: string, status: Lead['status']): Promise<Lead> => {
    const res = await apiClient.patch(`/leads/${leadId}/status`, { status });
    return res.data.data;
  },

  addLeadNote: async (leadId: string, note: { text: string; author: string }): Promise<Lead> => {
    const res = await apiClient.post(`/leads/${leadId}/notes`, note);
    return res.data.data;
  },

  deleteLead: async (leadId: string): Promise<void> => {
    await apiClient.delete(`/leads/${leadId}`);
  },
};

// Tasks API
export const tasksAPI = {
  createTask: async (data: {
    title: string;
    description?: string;
    status?: 'pendiente' | 'en_curso' | 'hecho';
    priority?: 'alta' | 'media' | 'baja';
    dueDate: string;
    assignedTo?: string;
    tags?: string[];
  }): Promise<Task> => {
    const res = await apiClient.post('/tasks', data);
    return res.data.data;
  },

  getTasks: async (status?: string, priority?: string): Promise<Task[]> => {
    const res = await apiClient.get('/tasks', {
      params: { status, priority },
    });
    return res.data.data;
  },

  getTask: async (taskId: string): Promise<Task> => {
    const res = await apiClient.get(`/tasks/${taskId}`);
    return res.data.data;
  },

  updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
    const res = await apiClient.put(`/tasks/${taskId}`, data);
    return res.data.data;
  },

  toggleTaskStatus: async (taskId: string): Promise<Task> => {
    const res = await apiClient.patch(`/tasks/${taskId}/toggle`);
    return res.data.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};

// Analytics API
export const analyticsAPI = {
  recordVisit: async (data: {
    page: string;
    path: string;
  }): Promise<any> => {
    const res = await apiClient.post('/analytics/visit', data);
    return res.data.data;
  },

  getVisitsByDateRange: async (days: number = 14): Promise<
    Array<{ date: string; visits: number; leads: number }>
  > => {
    const res = await apiClient.get('/analytics/visits', {
      params: { days },
    });
    return res.data.data;
  },

  getTotalVisits: async (days: number = 30): Promise<{ total: number }> => {
    const res = await apiClient.get('/analytics/total', {
      params: { days },
    });
    return res.data.data;
  },

  getTopPages: async (limit: number = 10): Promise<
    Array<{ page: string; path: string; visits: number }>
  > => {
    const res = await apiClient.get('/analytics/top-pages', {
      params: { limit },
    });
    return res.data.data;
  },

  getDashboardMetrics: async (days: number = 30): Promise<{
    totalVisits: number;
    totalLeads: number;
    conversionRate: number;
    topPages: Array<{ page: string; path: string; visits: number }>;
    leadsByStatus: Array<{ status: string; count: number }>;
    visitsByDay: Array<{ date: string; visits: number; leads: number }>;
  }> => {
    const res = await apiClient.get('/analytics/dashboard', {
      params: { days },
    });
    return res.data.data;
  },

  getLeadsByStatus: async (days: number = 30): Promise<Array<{ status: string; count: number }>> => {
    const res = await apiClient.get('/analytics/leads-by-status', {
      params: { days },
    });
    return res.data.data;
  },

  getPipelineValue: async (): Promise<{ active: number; won: number; lost: number }> => {
    const res = await apiClient.get('/analytics/pipeline-value');
    return res.data.data;
  },

  getTopBlogPosts: async (limit: number = 5): Promise<Array<{ title: string; views: number; slug: string }>> => {
    const res = await apiClient.get('/analytics/top-blog-posts', {
      params: { limit },
    });
    return res.data.data;
  },

  getReferrers: async (days: number = 30, limit: number = 10): Promise<Array<{ referrer: string; count: number }>> => {
    const res = await apiClient.get('/analytics/referrers', {
      params: { days, limit },
    });
    return res.data.data;
  },
};

// Email API
export const emailAPI = {
  getInbox: async (
    page = 1,
    limit = 20,
    unread = false
  ): Promise<{ emails: Email[]; pagination: any }> => {
    const res = await apiClient.get('/mail/inbox', {
      params: { page, limit, unread },
    });
    return res.data;
  },

  getSent: async (
    page = 1,
    limit = 20
  ): Promise<{ emails: Email[]; pagination: any }> => {
    const res = await apiClient.get('/mail/sent', {
      params: { page, limit },
    });
    return res.data;
  },

  getByFolder: async (
    folder: string,
    page = 1,
    limit = 20
  ): Promise<{ emails: Email[]; pagination: any }> => {
    const res = await apiClient.get(`/mail/folder/${folder}`, {
      params: { page, limit },
    });
    return res.data;
  },

  getById: async (id: string): Promise<{ email: Email }> => {
    const res = await apiClient.get(`/mail/${id}`);
    return res.data;
  },

  sendEmail: async (data: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content: string;
      contentType?: string;
    }>;
  }): Promise<any> => {
    const res = await apiClient.post('/mail/send', data);
    return res.data;
  },

  replyEmail: async (
    id: string,
    data: { text?: string; html?: string }
  ): Promise<any> => {
    const res = await apiClient.post(`/mail/reply/${id}`, data);
    return res.data;
  },

  syncEmails: async (limit = 50): Promise<any> => {
    const res = await apiClient.post('/mail/sync', { limit });
    return res.data;
  },

  markAsRead: async (id: string, read = true): Promise<{ email: Email }> => {
    const res = await apiClient.patch(`/mail/${id}/read`, { read });
    return res.data;
  },

  moveToFolder: async (id: string, folder: string): Promise<{ email: Email }> => {
    const res = await apiClient.patch(`/mail/${id}/folder`, { folder });
    return res.data;
  },

  deleteEmail: async (id: string): Promise<any> => {
    const res = await apiClient.delete(`/mail/${id}`);
    return res.data;
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const res = await apiClient.get('/mail/unread-count');
    return res.data;
  },

  testConfig: async (): Promise<{ smtp: string; imap: string }> => {
    const res = await apiClient.post('/mail/test');
    return res.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (): Promise<{ users: User[] }> => {
    const res = await apiClient.get('/users');
    return res.data;
  },

  getUser: async (userId: string): Promise<{ user: User }> => {
    const res = await apiClient.get(`/users/${userId}`);
    return res.data;
  },

  createUser: async (data: {
    username: string;
    email?: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'superadmin' | 'admin' | 'user';
  }): Promise<{ user: User }> => {
    const res = await apiClient.post('/users', data);
    return res.data;
  },

  updateUser: async (userId: string, data: {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: 'superadmin' | 'admin' | 'user';
  }): Promise<{ user: User }> => {
    const res = await apiClient.patch(`/users/${userId}`, data);
    return res.data;
  },

  updateUserPassword: async (userId: string, password: string): Promise<{ message: string }> => {
    const res = await apiClient.patch(`/users/${userId}/password`, { password });
    return res.data;
  },

  updateUserStatus: async (userId: string, isActive: boolean): Promise<{ user: User }> => {
    const res = await apiClient.patch(`/users/${userId}/status`, { isActive });
    return res.data;
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/users/${userId}`);
    return res.data;
  },
};

export default apiClient;
