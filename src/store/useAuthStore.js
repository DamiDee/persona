// ============================================================
// useAuthStore — Zustand Auth State
// Mock auth with localStorage persistence.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../lib/mockApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.login(credentials);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.signup(data);
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      googleLogin: async () => {
        set({ isLoading: true, error: null });
        try {
          const user = await authApi.googleOAuth();
          set({ user, isAuthenticated: true, isLoading: false });
          return user;
        } catch (err) {
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        await authApi.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      upgradeToPremium: () => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, plan: "premium" } });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "persona-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
