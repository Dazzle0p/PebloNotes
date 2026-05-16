import { create } from 'zustand';
import { authApi } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isInitialized: false,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) { set({ isInitialized: true }); return; }
    try {
      const { data } = await authApi.me();
      set({ user: data.user, isInitialized: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isLoading: false });
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    const { data } = await authApi.signup({ name, email, password });
    localStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  setLoading: (isLoading) => set({ isLoading }),
}));
