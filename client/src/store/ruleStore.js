import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useRuleStore = create((set, get) => ({
  rules: [],
  isLoading: false,
  error: null,

  fetchRules: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/rules");
      set({ rules: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addRule: async (text) => {
    try {
      const response = await api.post("/rules", { text });
      set((state) => ({ rules: [...state.rules, response.data] }));
      toast.success("Rule added");
    } catch (error) {
      toast.error("Failed to add rule");
    }
  },

  updateRule: async (id, data) => {
    try {
      const response = await api.put(`/rules/${id}`, data);
      set((state) => ({
        rules: state.rules.map((r) => (r._id === id ? response.data : r)),
      }));
    } catch (error) {
      toast.error("Failed to update rule");
    }
  },

  deleteRule: async (id) => {
    const prevRules = get().rules;
    set((state) => ({ rules: state.rules.filter((r) => r._id !== id) }));
    try {
      await api.delete(`/rules/${id}`);
      toast.success("Rule deleted");
    } catch (error) {
      set({ rules: prevRules });
      toast.error("Failed to delete rule");
    }
  },

  reorderRules: (newRules) => {
    // Just local state update for drag and drop
    set({ rules: newRules });
    // TODO: persist order to backend if API supported batch update
  },
}));
