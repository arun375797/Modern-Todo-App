import { create } from "zustand";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useTodoStore = create((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async (filters = {}) => {
    set({ isLoading: true });
    try {
      // Build query string
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/todos?${params}`);
      set({ todos: response.data, isLoading: false, error: null });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      toast.error("Failed to fetch todos");
    }
  },

  addTodo: async (todoData) => {
    try {
      const response = await api.post("/todos", todoData);
      set((state) => ({ todos: [...state.todos, response.data] }));
      toast.success("Todo added!");
    } catch (error) {
      toast.error("Failed to add todo");
    }
  },

  updateTodo: async (id, curData) => {
    // Optimistic update
    const prevTodos = get().todos;
    set((state) => ({
      todos: state.todos.map((t) => (t._id === id ? { ...t, ...curData } : t)),
    }));

    try {
      await api.put(`/todos/${id}`, curData);
      // Ideally fetch fresh data or update with response, but optimistic is fine for now
    } catch (error) {
      // Rollback
      set({ todos: prevTodos });
      toast.error("Failed to update todo");
    }
  },

  deleteTodo: async (id) => {
    const prevTodos = get().todos;
    set((state) => ({
      todos: state.todos.filter((t) => t._id !== id),
    }));

    try {
      await api.delete(`/todos/${id}`);
      toast.success("Todo deleted");
    } catch (error) {
      set({ todos: prevTodos });
      toast.error("Failed to delete todo");
    }
  },
}));
