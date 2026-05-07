// API service for AGENTIKA admin - connects to real backend
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { getLocalStorageItem } from './browser';
import type { ApiResponse, ApiError } from './types';

// Get auth token from localStorage (SSR-safe)
const getAuthToken = () => getLocalStorageItem('auth_token');

// Generic fetch wrapper with auth
async function fetchAPI<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    const errorMessage = (error as ApiError).error || error.message || 'Request failed';
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data;
}

// Helper to extract data from ApiResponse
function extractData<T>(response: ApiResponse<T>): T {
  return response.data;
}

// Leads API
export const leadsAPI = {
  getAll: () => fetchAPI('/leads'),
  getById: (id: string) => fetchAPI(`/leads/${id}`),
  update: (id: string, data: any) => fetchAPI(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  updateStatus: (id: string, status: string) => fetchAPI(`/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  addNote: (id: string, text: string) => fetchAPI(`/leads/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }),
  delete: (id: string) => fetchAPI(`/leads/${id}`, {
    method: 'DELETE',
  }),
};

// Blog API
export const blogAPI = {
  getAll: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/blog${queryString}`);
  },
  getById: (id: string) => fetchAPI(`/blog/post/${id}`),
  create: (data: any) => fetchAPI('/blog', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/blog/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchAPI(`/blog/${id}`, {
    method: 'DELETE',
  }),
};

// Tasks API
export const tasksAPI = {
  getAll: () => fetchAPI('/tasks'),
  getById: (id: string) => fetchAPI(`/tasks/${id}`),
  create: (data: any) => fetchAPI('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  toggleStatus: (id: string) => fetchAPI(`/tasks/${id}/toggle`, {
    method: 'PATCH',
  }),
  delete: (id: string) => fetchAPI(`/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// Analytics API
export const analyticsAPI = {
  getVisits: (params: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/analytics/visits${queryString}`);
  },
  getTotal: () => fetchAPI('/analytics/total'),
  getDashboard: () => fetchAPI('/analytics/dashboard'),
  getLeadsByStatus: () => fetchAPI('/analytics/leads-by-status'),
  getPipelineValue: () => fetchAPI('/analytics/pipeline-value'),
  getTopBlogPosts: () => fetchAPI('/analytics/top-blog-posts'),
  getReferrers: () => fetchAPI('/analytics/referrers'),
};

// Auth API
export const authAPI = {
  login: (usernameOrEmail: string, password: string) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail, password }),
  }),
  adminLogin: (usernameOrEmail: string, password: string) => fetchAPI('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail, password }),
  }),
  logout: () => fetchAPI('/auth/logout', {
    method: 'POST',
  }),
  me: () => fetchAPI('/auth/me'),
  changePassword: (currentPassword: string, newPassword: string) => fetchAPI('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }),
};

// Users API
export const usersAPI = {
  getAll: () => fetchAPI('/users'),
  getById: (id: string) => fetchAPI(`/users/${id}`),
  create: (data: any) => fetchAPI('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchAPI(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  updatePassword: (id: string, password: string) => fetchAPI(`/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  }),
  delete: (id: string) => fetchAPI(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// Mail API
export const mailAPI = {
  getInbox: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/mail/inbox${queryString}`);
  },
  getSent: (params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/mail/sent${queryString}`);
  },
  getByFolder: (folder: string, params?: any) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return fetchAPI(`/mail/folder/${folder}${queryString}`);
  },
  getById: (id: string) => fetchAPI(`/mail/${id}`),
  getUnreadCount: () => fetchAPI('/mail/unread-count'),
  send: (data: any) => fetchAPI('/mail/send', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  reply: (id: string, data: any) => fetchAPI(`/mail/reply/${id}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  sync: (limit?: number) => fetchAPI('/mail/sync', {
    method: 'POST',
    body: JSON.stringify({ limit: limit || 50 }),
  }),
  markAsRead: (id: string, read: boolean) => fetchAPI(`/mail/${id}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ read }),
  }),
  moveToFolder: (id: string, folder: string) => fetchAPI(`/mail/${id}/folder`, {
    method: 'PATCH',
    body: JSON.stringify({ folder }),
  }),
  delete: (id: string) => fetchAPI(`/mail/${id}`, {
    method: 'DELETE',
  }),
  testConfig: () => fetchAPI('/mail/test', {
    method: 'POST',
  }),
};
