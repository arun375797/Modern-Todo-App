import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true, // Initial loading state

      // Initialize auth from token if exists
      checkAuth: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }
        try {
          const response = await api.get("/auth/me");
          set({ user: response.data, isAuthenticated: true, isLoading: false });
          // Apply theme from user preferences
          const theme = response.data.preferences?.theme || "calm";
          document.documentElement.setAttribute("data-theme", theme);

          if (response.data.preferences?.font) {
            document.documentElement.style.setProperty(
              "--font-primary",
              response.data.preferences.font,
            );
          }
          if (response.data.preferences?.textColor) {
            document.documentElement.style.setProperty(
              "--color-text",
              response.data.preferences.textColor,
            );
          }
        } catch (error) {
          console.error(error);
          // If offline, we keep our current state but set loading to false
          if (!window.navigator.onLine) {
            set({ isLoading: false });
            return;
          }
          localStorage.removeItem("token");
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email, password) => {
        try {
          const response = await api.post("/auth/login", { email, password });
          localStorage.setItem("token", response.data.token);
          set({ user: response.data, isAuthenticated: true });
          document.documentElement.setAttribute(
            "data-theme",
            response.data.preferences?.theme || "calm",
          );
          toast.success("Welcome back!");
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Login failed");
          return false;
        }
      },

      register: async (name, email, password) => {
        try {
          const response = await api.post("/auth/register", {
            name,
            email,
            password,
          });
          localStorage.setItem("token", response.data.token);
          set({ user: response.data, isAuthenticated: true });
          document.documentElement.setAttribute("data-theme", "calm");
          toast.success("Account created!");
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Registration failed");
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, isAuthenticated: false });
        document.documentElement.removeAttribute("data-theme");
        toast.success("Logged out");
      },

      updatePreferences: async (preferences) => {
        try {
          const response = await api.put("/users/preferences", preferences);
          const currentUser = get().user;
          const updatedUser = {
            ...currentUser,
            preferences: { ...currentUser.preferences, ...response.data },
          };
          set({ user: updatedUser });

          if (preferences.theme) {
            document.documentElement.setAttribute(
              "data-theme",
              preferences.theme,
            );
          }

          // Update font globally if changed
          if (preferences.font) {
            document.documentElement.style.setProperty(
              "--font-primary",
              preferences.font,
            );
          }

          // Update text color globally if changed
          if (preferences.textColor) {
            document.documentElement.style.setProperty(
              "--color-text",
              preferences.textColor,
            );
          } else if (preferences.textColor === "") {
            // Reset if empty
            document.documentElement.style.removeProperty("--color-text");
          }
        } catch (error) {
          toast.error("Failed to update settings");
        }
      },

      uploadBackground: async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        try {
          const response = await api.post(
            "/users/upload/background",
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          const currentUser = get().user;
          // Merge deep preferences
          const updatedUser = {
            ...currentUser,
            preferences: {
              ...currentUser.preferences,
              background: response.data.preferences.background,
            },
          };
          set({ user: updatedUser });
          toast.success("Background uploaded");
        } catch (error) {
          toast.error("Failed to upload background");
        }
      },
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    },
  ),
);
