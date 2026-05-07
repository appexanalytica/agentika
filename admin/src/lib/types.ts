// API Response types
export interface ApiResponse<T = any> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Auth types
export interface User {
  id: string;
  username: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'user';
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: true;
  data: {
    user: User;
    token: string;
  };
}

export interface MeResponse {
  success: true;
  data: {
    user: User;
  };
}

// Lead types
export interface LeadNote {
  id: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  value: number;
  status: string;
  source: string;
  notes: LeadNote[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadsResponse {
  success: true;
  data: {
    leads: Lead[];
  };
}

// Blog types
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status: 'borrador' | 'publicado' | 'archivado';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  success: true;
  data: {
    posts: Post[];
  };
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pendiente' | 'en_progreso' | 'hecho';
  priority: 'baja' | 'media' | 'alta';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  success: true;
  data: {
    tasks: Task[];
  };
}

// Email types
export interface EmailLog {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  read: boolean;
  folder: string;
  body?: string;
}
