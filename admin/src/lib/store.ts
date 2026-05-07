// Real store with React subscription via custom hook - connects to backend API
import { useSyncExternalStore } from "react";
import { leadsAPI, blogAPI, tasksAPI, authAPI, usersAPI } from "./api";
import type { Lead, BlogPost, Task, EmailLog, LeadStatus, PostStatus } from "./mock-data";
import type { ApiResponse, User } from "./types";
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem, isBrowser } from "./browser";

type State = {
  leads: Lead[];
  posts: BlogPost[];
  tasks: Task[];
  emails: EmailLog[];
  authed: boolean;
  user: User | null;
  loading: boolean;
};

let state: State = {
  leads: [],
  posts: [],
  tasks: [],
  emails: [],
  authed: false,
  user: null,
  loading: false,
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

// ---------- SINCRÓNICO: Restaurar usuario del caché ANTES de que React renderice ----------
// Esto evita que el router redirija antes de que la auth se restaure
if (isBrowser) {
  const cachedToken = getLocalStorageItem('auth_token');
  const cachedUser = getLocalStorageItem('auth_user');
  if (cachedToken && cachedUser) {
    try {
      const user = JSON.parse(cachedUser) as User;
      state = { ...state, authed: true, user };
      // No llamamos notify() aquí porque aún no hay listeners registrados
    } catch {}
  }
}

// Load initial data from API
const loadInitialData = async () => {
  try {
    state = { ...state, loading: true };
    notify();
    
    // Check auth first using store.restoreAuth
    const restored = await store.restoreAuth();
    
    // Only load data if authenticated
    if (restored) {
      const [leadsResponse, postsResponse, tasksResponse] = await Promise.all([
        leadsAPI.getAll().catch(() => ({ data: { leads: [] } })),
        blogAPI.getAll().catch(() => ({ data: { posts: [] } })),
        tasksAPI.getAll().catch(() => ({ data: { tasks: [] } })),
      ]);
      
      const leadsData = (leadsResponse as ApiResponse<{ leads: Lead[] }>)?.data?.leads || [];
      const postsData = (postsResponse as ApiResponse<{ posts: BlogPost[] }>)?.data?.posts || [];
      const tasksData = (tasksResponse as ApiResponse<{ tasks: Task[] }>)?.data?.tasks || [];
      
      state = {
        ...state,
        leads: leadsData,
        posts: postsData,
        tasks: tasksData,
        loading: false,
      };
    } else {
      state = { ...state, loading: false };
    }
    notify();
  } catch (error) {
    console.error('Error loading initial data:', error);
    state = { ...state, loading: false };
    notify();
  }
};

export const store = {
  getState: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  // Auth
  syncAuthFromStorage: () => {
    if (!isBrowser) return false;
    const token = getLocalStorageItem('auth_token');
    const cachedUser = getLocalStorageItem('auth_user');
    if (token && cachedUser) {
      try {
        const user = JSON.parse(cachedUser) as User;
        state = { ...state, authed: true, user };
        notify();
        return true;
      } catch {}
    }
    return false;
  },
  login: async (usernameOrEmail: string, password: string) => {
    try {
      const response = await authAPI.login(usernameOrEmail, password) as ApiResponse<{ user: User; token: string }>;
      const { user, token } = response.data;
      setLocalStorageItem('auth_token', token);
      setLocalStorageItem('auth_user', JSON.stringify(user));
      state = { ...state, authed: true, user };
      notify();
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  },
  adminLogin: async (usernameOrEmail: string, password: string) => {
    try {
      const response = await authAPI.adminLogin(usernameOrEmail, password) as ApiResponse<{ user: User; token: string }>;
      const { user, token } = response.data;
      setLocalStorageItem('auth_token', token);
      setLocalStorageItem('auth_user', JSON.stringify(user));
      state = { ...state, authed: true, user };
      notify();
      return { success: true };
    } catch (error: any) {
      console.error('Admin login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  },
  restoreAuth: async () => {
    if (!isBrowser) return false;
    const token = getLocalStorageItem('auth_token');
    if (!token) return false;
    
    const cachedUser = getLocalStorageItem('auth_user');
    if (cachedUser) {
      try {
        const user = JSON.parse(cachedUser) as User;
        state = { ...state, authed: true, user };
        notify();
      } catch {}
    }
    
    try {
      const response = await authAPI.me() as ApiResponse<{ user: User }>;
      const user = response.data.user;
      setLocalStorageItem('auth_user', JSON.stringify(user));
      state = { ...state, authed: true, user };
      notify();
      return true;
    } catch (error) {
      console.error('[restoreAuth] Error validating token:', error);
      if (!cachedUser) {
        state = { ...state, authed: false, user: null };
        notify();
        return false;
      }
      return true;
    }
  },
  logout: () => {
    removeLocalStorageItem('auth_token');
    removeLocalStorageItem('auth_user');
    state = { ...state, authed: false, user: null };
    notify();
  },
  // Leads
  loadLeads: async () => {
    try {
      const response = await leadsAPI.getAll() as ApiResponse<{ leads: Lead[] }>;
      state = { ...state, leads: response.data.leads };
      notify();
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  },
  updateLeadStatus: async (id: string, status: LeadStatus) => {
    try {
      await leadsAPI.updateStatus(id, status);
      state = { ...state, leads: state.leads.map(l => l.id === id ? { ...l, status } : l) };
      notify();
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  },
  addLeadNote: async (id: string, text: string) => {
    try {
      await leadsAPI.addNote(id, text);
      state = {
        ...state,
        leads: state.leads.map(l => l.id === id ? {
          ...l,
          notes: [...l.notes, { id: crypto.randomUUID(), text, createdAt: new Date().toISOString(), author: "Tú" }],
        } : l),
      };
      notify();
    } catch (error) {
      console.error('Error adding lead note:', error);
    }
  },
  deleteLead: async (id: string) => {
    try {
      await leadsAPI.delete(id);
      state = { ...state, leads: state.leads.filter(l => l.id !== id) };
      notify();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  },
  // Posts
  upsertPost: async (post: BlogPost) => {
    try {
      const exists = state.posts.find(p => p.id === post.id);
      if (exists) {
        await blogAPI.update(post.id, post);
      } else {
        await blogAPI.create(post);
      }
      state = {
        ...state,
        posts: exists
          ? state.posts.map(p => p.id === post.id ? post : p)
          : [post, ...state.posts],
      };
      notify();
    } catch (error) {
      console.error('Error upserting post:', error);
    }
  },
  deletePost: async (id: string) => {
    try {
      await blogAPI.delete(id);
      state = { ...state, posts: state.posts.filter(p => p.id !== id) };
      notify();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  },
  setPostStatus: async (id: string, status: PostStatus) => {
    try {
      await blogAPI.update(id, { status, publishedAt: status === "publicado" ? new Date().toISOString() : undefined });
      state = { ...state, posts: state.posts.map(p => p.id === id ? { ...p, status, publishedAt: status === "publicado" ? new Date().toISOString() : p.publishedAt } : p) };
      notify();
    } catch (error) {
      console.error('Error setting post status:', error);
    }
  },
  // Tasks
  toggleTask: async (id: string) => {
    try {
      await tasksAPI.toggleStatus(id);
      state = {
        ...state,
        tasks: state.tasks.map(t => t.id === id ? {
          ...t,
          status: t.status === "hecho" ? "pendiente" : "hecho",
        } : t),
      };
      notify();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  },
  addTask: async (task: Task) => {
    try {
      await tasksAPI.create(task);
      state = { ...state, tasks: [task, ...state.tasks] };
      notify();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  },
  // Emails
  sendEmail: (email: EmailLog) => {
    // Email logging is handled by backend, just update local state for UI
    state = { ...state, emails: [email, ...state.emails] };
    notify();
  },
  // Initialize data loading
  loadData: loadInitialData,
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state));
}

// Initialize data on module load - DO NOT call during SSR
// loadInitialData() should be called from a useEffect in the root component
// if (isBrowser) {
//   loadInitialData();
// }
