// hooks/useAPI.ts - Admin API Integration
import { useCallback } from 'react';
import { authAPI, blogAPI, leadsAPI, tasksAPI, analyticsAPI, mailAPI, usersAPI } from '@/lib/api';
import { store } from '@/lib/store';

// Hook de autenticación
export const useAuth = () => {
  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const result = await store.adminLogin(usernameOrEmail, password);
    return result;
  }, []);

  const logout = useCallback(() => {
    store.logout();
  }, []);

  const getProfile = useCallback(async () => {
    return await authAPI.me();
  }, []);

  return { login, logout, getProfile };
};

// Hook de leads
export const useLeads = () => {
  const getLeads = useCallback(async () => {
    return await leadsAPI.getAll();
  }, []);

  const getLead = useCallback(async (id: string) => {
    return await leadsAPI.getById(id);
  }, []);

  const updateLead = useCallback(async (id: string, data: Record<string, any>) => {
    return await leadsAPI.update(id, data);
  }, []);

  const updateLeadStatus = useCallback(async (id: string, status: string) => {
    return await leadsAPI.updateStatus(id, status);
  }, []);

  const addLeadNote = useCallback(async (id: string, note: string) => {
    return await leadsAPI.addNote(id, note);
  }, []);

  return { getLeads, getLead, updateLead, updateLeadStatus, addLeadNote };
};

// Hook de blog
export const useBlog = () => {
  const getPosts = useCallback(async (params?: { page?: number; limit?: number; status?: string }) => {
    return await blogAPI.getAll(params);
  }, []);

  const getPost = useCallback(async (postId: string) => {
    return await blogAPI.getById(postId);
  }, []);

  const createPost = useCallback(async (data: Record<string, any>) => {
    return await blogAPI.create(data);
  }, []);

  const updatePost = useCallback(async (postId: string, data: Record<string, any>) => {
    return await blogAPI.update(postId, data);
  }, []);

  const deletePost = useCallback(async (postId: string) => {
    return await blogAPI.delete(postId);
  }, []);

  return { getPosts, getPost, createPost, updatePost, deletePost };
};

// Hook de tareas
export const useTasks = () => {
  const getTasks = useCallback(async () => {
    return await tasksAPI.getAll();
  }, []);

  const createTask = useCallback(async (data: Record<string, any>) => {
    return await tasksAPI.create(data);
  }, []);

  const updateTask = useCallback(async (id: string, data: Record<string, any>) => {
    return await tasksAPI.update(id, data);
  }, []);

  return { getTasks, createTask, updateTask };
};

// Hook de analytics
export const useAnalytics = () => {
  const getDashboard = useCallback(async () => {
    return await analyticsAPI.getDashboard();
  }, []);

  const getVisits = useCallback(async (params?: { days?: number; start?: string; end?: string }) => {
    return await analyticsAPI.getVisits(params);
  }, []);

  return { getDashboard, getVisits };
};

// Hook de emails
export const useMail = () => {
  const getInbox = useCallback(async (params?: { page?: number; limit?: number }) => {
    return await mailAPI.getInbox(params);
  }, []);

  const sendEmail = useCallback(async (data: Record<string, any>) => {
    return await mailAPI.send(data);
  }, []);

  return { getInbox, sendEmail };
};

// Hook de usuarios
export const useUsers = () => {
  const getUsers = useCallback(async () => {
    return await usersAPI.getAll();
  }, []);

  const getUser = useCallback(async (id: string) => {
    return await usersAPI.getById(id);
  }, []);

  return { getUsers, getUser };
};

export default { useAuth, useLeads, useBlog, useTasks, useAnalytics, useMail, useUsers };
