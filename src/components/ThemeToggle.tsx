"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const d = document.documentElement.classList.contains("dark");
    setDark(d);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark, mounted]);

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-white/20 bg-white/10 backdrop-blur
                 text-white hover:bg-white/20 dark:border-white/20 dark:text-white"
    >
      {dark ? (
        /* Sun icon */
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 4.5a1 1 0 0 1 1-1h.5a1 1 0 1 1 0 2H13a1 1 0 0 1-1-1ZM6.22 6.22a1 1 0 0 1 1.42 0l.35.35a1 1 0 1 1-1.42 1.42l-.35-.35a1 1 0 0 1 0-1.42ZM4.5 11a1 1 0 0 1 1-1h.5a1 1 0 1 1 0 2H5.5a1 1 0 0 1-1-1Zm8.5 8.5a1 1 0 0 1-1 1H11a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1Zm7-7.5a1 1 0 0 1-1 1h-.5a1 1 0 1 1 0-2h.5a1 1 0 0 1 1 1ZM16 7.57a4.43 4.43 0 1 1-8.86 0 4.43 4.43 0 0 1 8.86 0ZM17.78 6.22a1 1 0 0 1 0 1.42l-.35.35a1 1 0 1 1-1.42-1.42l.35-.35a1 1 0 0 1 1.42 0ZM18.5 17a1 1 0 0 1-1.42 1.42l-.35-.35a1 1 0 1 1 1.42-1.42l.35.35ZM6.22 17.78a1 1 0 0 1-1.42 0 1 1 0 0 1 0-1.42l.35-.35a1 1 0 1 1 1.42 1.42l-.35.35Z" />
        </svg>
      ) : (
        /* Moon icon */
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z" />
        </svg>
      )}
    </button>
  );
}
