import { create } from 'zustand';
import api from '../services/api';

const useNotesStore = create((set, get) => ({
  notes: [],
  activeNote: null,
  isLoading: false,
  isSaving: false,
  pagination: null,
  filters: { search: '', tags: '', archived: false, sort: '-updatedAt' },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),

  fetchNotes: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.tags) params.set('tags', filters.tags);
      if (filters.archived) params.set('archived', 'true');
      params.set('sort', filters.sort);

      const { data } = await api.get(`/notes?${params}`);
      set({ notes: data.notes, pagination: data.pagination, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchNote: async (id) => {
    try {
      const { data } = await api.get(`/notes/${id}`);
      set({ activeNote: data.note });
      return data.note;
    } catch {
      return null;
    }
  },

  createNote: async () => {
    try {
      const { data } = await api.post('/notes', { title: 'Untitled Note', content: '' });
      set((s) => ({ notes: [data.note, ...s.notes], activeNote: data.note }));
      return data.note;
    } catch {
      return null;
    }
  },

  updateNote: async (id, updates) => {
    set({ isSaving: true });
    try {
      const { data } = await api.patch(`/notes/${id}`, updates);
      set((s) => ({
        notes: s.notes.map((n) => (n._id === id ? { ...n, ...data.note } : n)),
        activeNote: s.activeNote?._id === id ? data.note : s.activeNote,
        isSaving: false,
      }));
      return data.note;
    } catch {
      set({ isSaving: false });
      return null;
    }
  },

  deleteNote: async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      set((s) => ({
        notes: s.notes.filter((n) => n._id !== id),
        activeNote: s.activeNote?._id === id ? null : s.activeNote,
      }));
    } catch {
      throw new Error('Failed to delete');
    }
  },

  generateSummary: async (id) => {
    try {
      const { data } = await api.post(`/notes/${id}/generate-summary`);
      set((s) => ({
        activeNote: s.activeNote?._id === id
          ? { ...s.activeNote, ai_output: data.ai_output, ai_usage_count: data.ai_usage_count }
          : s.activeNote,
      }));
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to generate summary');
    }
  },

  toggleShare: async (id) => {
    try {
      const { data } = await api.post(`/notes/${id}/share`);
      set((s) => ({
        notes: s.notes.map((n) =>
          n._id === id ? { ...n, is_public: data.is_public, share_id: data.share_id } : n
        ),
        activeNote: s.activeNote?._id === id
          ? { ...s.activeNote, is_public: data.is_public, share_id: data.share_id }
          : s.activeNote,
      }));
      return data;
    } catch {
      throw new Error('Failed to toggle sharing');
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),
}));

export default useNotesStore;
