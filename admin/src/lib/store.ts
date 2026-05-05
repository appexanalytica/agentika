// Simple in-memory mock store with React subscription via custom hook
import { useSyncExternalStore } from "react";
import {
  mockLeads, mockPosts, mockTasks, mockEmails,
  type Lead, type BlogPost, type Task, type EmailLog, type LeadStatus, type PostStatus,
} from "./mock-data";

type State = {
  leads: Lead[];
  posts: BlogPost[];
  tasks: Task[];
  emails: EmailLog[];
  authed: boolean;
};

// Inicializar estado con verificación de localStorage
const initializeAuthState = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('auth_token');
  }
  return false;
};

let state: State = {
  leads: [...mockLeads],
  posts: [...mockPosts],
  tasks: [...mockTasks],
  emails: [...mockEmails],
  authed: initializeAuthState(),
};

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const store = {
  getState: () => state,
  subscribe: (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  // Auth
  login: () => { state = { ...state, authed: true }; notify(); },
  logout: () => { state = { ...state, authed: false }; notify(); },
  // Leads
  updateLeadStatus: (id: string, status: LeadStatus) => {
    state = { ...state, leads: state.leads.map(l => l.id === id ? { ...l, status } : l) };
    notify();
  },
  addLeadNote: (id: string, text: string) => {
    state = {
      ...state,
      leads: state.leads.map(l => l.id === id ? {
        ...l,
        notes: [...l.notes, { id: crypto.randomUUID(), text, createdAt: new Date().toISOString(), author: "Tú" }],
      } : l),
    };
    notify();
  },
  deleteLead: (id: string) => {
    state = { ...state, leads: state.leads.filter(l => l.id !== id) };
    notify();
  },
  // Posts
  upsertPost: (post: BlogPost) => {
    const exists = state.posts.find(p => p.id === post.id);
    state = {
      ...state,
      posts: exists
        ? state.posts.map(p => p.id === post.id ? post : p)
        : [post, ...state.posts],
    };
    notify();
  },
  deletePost: (id: string) => {
    state = { ...state, posts: state.posts.filter(p => p.id !== id) };
    notify();
  },
  setPostStatus: (id: string, status: PostStatus) => {
    state = { ...state, posts: state.posts.map(p => p.id === id ? { ...p, status, publishedAt: status === "publicado" ? new Date().toISOString() : p.publishedAt } : p) };
    notify();
  },
  // Tasks
  toggleTask: (id: string) => {
    state = {
      ...state,
      tasks: state.tasks.map(t => t.id === id ? {
        ...t,
        status: t.status === "hecho" ? "pendiente" : "hecho",
      } : t),
    };
    notify();
  },
  addTask: (task: Task) => {
    state = { ...state, tasks: [task, ...state.tasks] };
    notify();
  },
  // Emails
  sendEmail: (email: EmailLog) => {
    state = { ...state, emails: [email, ...state.emails] };
    notify();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state));
}
