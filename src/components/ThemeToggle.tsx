"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <button
      type="button"
      onClick={() => setDark(v => !v)}
      className="text-xs opacity-75 underline"
      aria-label="Toggle theme"
    >
      {dark ? "Dark" : "Light"}
    </button>
  );
}
