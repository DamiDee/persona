// ============================================================
// useThemeStore — Zustand Theme State
// Manages light/dark/system theme with localStorage persistence.
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    root.classList.toggle("dark", prefersDark);
  } else {
    root.setAttribute("data-theme", theme);
    root.classList.toggle("dark", theme === "dark");
  }
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "dark", // "light" | "dark" | "system"

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initTheme: () => {
        const { theme } = get();
        applyTheme(theme);

        // Watch for system theme changes when in "system" mode
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", () => {
          if (get().theme === "system") {
            applyTheme("system");
          }
        });
      },

      getEffectiveTheme: () => {
        const { theme } = get();
        if (theme === "system") {
          return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        return theme;
      },
    }),
    {
      name: "persona-theme",
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);
