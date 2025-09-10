"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync with current DOM on mount
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const html = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    if (next) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1
                 bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20
                 text-xs"
    >
      {/* Moon / Sun inline SVGs so you don't need to provide assets */}
      {isDark ? (
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/>
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM4.96 19.04l1.41 1.41 1.8-1.79-1.41-1.41-1.8 1.79zM20 13h3v-2h-3v2zm-1.95 7.46l1.41-1.41-1.79-1.8-1.41 1.41 1.79 1.8zM13 1h-2v3h2V1zm-7.05 4.05l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM12 6a6 6 0 100 12A6 6 0 0012 6z"/>
        </svg>
      )}
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
