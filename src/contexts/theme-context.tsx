"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("uc_theme") as Theme | null;
    const initialTheme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("uc_theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
