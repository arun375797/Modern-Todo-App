import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useTodoStore = create(
  persist(
    (set, get) => ({
      todos: [],
      activeFocusTask: null,
      isLoading: false,
      error: null,
      pendingActions: [], // Queue for offline actions

      setFocusTask: (todo) => set({ activeFocusTask: todo }),
      clearFocusTask: () => set({ activeFocusTask: null }),

      fetchTodos: async (filters = {}) => {
        set({ isLoading: true });
        try {
          const params = new URLSearchParams(filters).toString();
          const response = await api.get(`/todos?${params}`);
          set({ todos: response.data, isLoading: false, error: null });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          if (window.navigator.onLine) {
            toast.error("Failed to fetch todos");
          }
        }
      },

      addTodo: async (todoData) => {
        // Optimistic UI update with a temporary ID
        const tempId = `temp-${Date.now()}`;
        const newTodo = { ...todoData, _id: tempId, isPending: true };

        set((state) => ({ todos: [...state.todos, newTodo] }));

        if (!window.navigator.onLine) {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              { type: "ADD", data: todoData, tempId },
            ],
          }));
          toast.success("Saved offline!");
          return;
        }

        try {
          const response = await api.post("/todos", todoData);
          set((state) => ({
            todos: state.todos.map((t) =>
              t._id === tempId ? response.data : t,
            ),
          }));
          toast.success("Todo added!");
        } catch (error) {
          // If request fails but we might be offline now
          if (!window.navigator.onLine) {
            set((state) => ({
              pendingActions: [
                ...state.pendingActions,
                { type: "ADD", data: todoData, tempId },
              ],
            }));
            toast.success("Saved offline!");
          } else {
            // Actual error
            set((state) => ({
              todos: state.todos.filter((t) => t._id !== tempId),
            }));
            toast.error("Failed to add todo");
          }
        }
      },

      updateTodo: async (id, curData) => {
        const prevTodos = get().todos;
        set((state) => ({
          todos: state.todos.map((t) =>
            t._id === id ? { ...t, ...curData } : t,
          ),
          activeFocusTask:
            state.activeFocusTask?._id === id
              ? { ...state.activeFocusTask, ...curData }
              : state.activeFocusTask,
        }));

        if (!window.navigator.onLine) {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              { type: "UPDATE", id, data: curData },
            ],
          }));
          return;
        }

        try {
          await api.put(`/todos/${id}`, curData);
        } catch (error) {
          if (!window.navigator.onLine) {
            set((state) => ({
              pendingActions: [
                ...state.pendingActions,
                { type: "UPDATE", id, data: curData },
              ],
            }));
          } else {
            set({ todos: prevTodos });
            toast.error("Failed to update todo");
          }
        }
      },

      toggleSubtask: async (todoId, subtaskIndex, completed) => {
        const prevTodos = get().todos;
        const todo = prevTodos.find((t) => t._id === todoId);
        if (!todo) return;

        const newSubtasks = [...todo.subtasks];
        newSubtasks[subtaskIndex] = { ...newSubtasks[subtaskIndex], completed };

        set((state) => ({
          todos: state.todos.map((t) =>
            t._id === todoId ? { ...t, subtasks: newSubtasks } : t,
          ),
        }));

        if (!window.navigator.onLine) {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              { type: "UPDATE", id: todoId, data: { subtasks: newSubtasks } },
            ],
          }));
          return;
        }

        try {
          await api.put(`/todos/${todoId}`, { subtasks: newSubtasks });
        } catch (error) {
          if (!window.navigator.onLine) {
            set((state) => ({
              pendingActions: [
                ...state.pendingActions,
                { type: "UPDATE", id: todoId, data: { subtasks: newSubtasks } },
              ],
            }));
          } else {
            set({ todos: prevTodos });
            toast.error("Failed to update subtask");
          }
        }
      },

      deleteTodo: async (id) => {
        const prevTodos = get().todos;
        set((state) => ({
          todos: state.todos.filter((t) => t._id !== id),
        }));

        if (!window.navigator.onLine) {
          set((state) => ({
            pendingActions: [...state.pendingActions, { type: "DELETE", id }],
          }));
          return;
        }

        try {
          await api.delete(`/todos/${id}`);
          toast.success("Todo deleted");
        } catch (error) {
          if (!window.navigator.onLine) {
            set((state) => ({
              pendingActions: [...state.pendingActions, { type: "DELETE", id }],
            }));
          } else {
            set({ todos: prevTodos });
            toast.error("Failed to delete todo");
          }
        }
      },

      sync: async () => {
        const { pendingActions } = get();
        if (pendingActions.length === 0) return;

        set({ isLoading: true });
        const remainingActions = [];

        for (const action of pendingActions) {
          try {
            if (action.type === "ADD") {
              const response = await api.post("/todos", action.data);
              set((state) => ({
                todos: state.todos.map((t) =>
                  t._id === action.tempId ? response.data : t,
                ),
              }));
            } else if (action.type === "UPDATE") {
              await api.put(`/todos/${action.id}`, action.data);
            } else if (action.type === "DELETE") {
              await api.delete(`/todos/${action.id}`);
            }
          } catch (error) {
            console.error("Failed to sync action:", action, error);
            remainingActions.push(action); // Keep failed actions to retry
          }
        }

        set({ pendingActions: remainingActions, isLoading: false });
        if (remainingActions.length === 0) {
          toast.success("All changes synced!");
          get().fetchTodos(); // Refresh data from server
        }
      },
    }),
    {
      name: "todo-storage",
      getStorage: () => localStorage,
    },
  ),
);
