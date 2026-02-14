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

      loginWithGoogle: async (token) => {
        try {
          const response = await api.post("/auth/google", { token });
          localStorage.setItem("token", response.data.token);
          set({ user: response.data, isAuthenticated: true });
          document.documentElement.setAttribute(
            "data-theme",
            response.data.preferences?.theme || "calm",
          );
          toast.success("Welcome back!");
          return true;
        } catch (error) {
          console.error("Google login error:", error);
          toast.error(error.response?.data?.message || "Login failed");
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
          console.log("updatePreferences called with:", preferences);

          // Apply theme immediately for instant visual feedback
          if (preferences.theme) {
            console.log("Setting theme attribute to:", preferences.theme);
            document.documentElement.setAttribute(
              "data-theme",
              preferences.theme,
            );
            // Force a reflow to ensure the theme is applied
            document.documentElement.offsetHeight;
          }

          // Apply font immediately if changed
          if (preferences.font) {
            document.documentElement.style.setProperty(
              "--font-primary",
              preferences.font,
            );
          }

          // Apply text color immediately if changed
          if (preferences.textColor) {
            document.documentElement.style.setProperty(
              "--color-text",
              preferences.textColor,
            );
          } else if (preferences.textColor === "") {
            // Reset if empty
            document.documentElement.style.removeProperty("--color-text");
          }

          // Update state optimistically
          const currentUser = get().user;
          const optimisticUser = {
            ...currentUser,
            preferences: { ...currentUser.preferences, ...preferences },
          };
          set({ user: optimisticUser });

          // Then sync with server
          const response = await api.put("/users/preferences", preferences);
          console.log("updatePreferences response:", response.data);

          // Update with server response
          const finalUser = {
            ...currentUser,
            preferences: { ...currentUser.preferences, ...response.data },
          };
          set({ user: finalUser });

          toast.success("Settings updated");
        } catch (error) {
          console.error("updatePreferences error:", error);
          toast.error("Failed to update settings");

          // Revert optimistic update on error
          const currentUser = get().user;
          // Reload from server or keep current state
          try {
            const response = await api.get("/auth/me");
            set({ user: response.data });
            // Reapply theme from server state
            if (response.data.preferences?.theme) {
              document.documentElement.setAttribute(
                "data-theme",
                response.data.preferences.theme,
              );
            }
          } catch (revertError) {
            console.error("Failed to revert state:", revertError);
          }
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
      onRehydrateStorage: () => (state) => {
        // Apply theme immediately when state is rehydrated from localStorage
        if (state?.user?.preferences?.theme) {
          console.log("Rehydrating theme:", state.user.preferences.theme);
          document.documentElement.setAttribute(
            "data-theme",
            state.user.preferences.theme,
          );
        }
      },
    },
  ),
);
