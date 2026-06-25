import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("razma-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (e) {
      console.warn("Storage access not allowed in this environment:", e);
    }
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body?.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body?.classList.remove("dark");
    }
    try {
      localStorage.setItem("razma-theme", theme);
    } catch (e) {
      // Ignore security errors in sandboxed context
    }
  }, [theme]);

  return { theme, setTheme };
}
