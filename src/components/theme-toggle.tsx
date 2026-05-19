"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "auralync-theme";

export function ThemeToggle() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark-premium", enabled);
  }, [enabled]);

  function toggleTheme() {
    const next = !enabled;
    setEnabled(next);
    document.documentElement.classList.toggle("dark-premium", next);
    window.localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="premium-action flex h-11 w-full items-center justify-between rounded-lg border border-[#dfe8e7] bg-white px-3 text-sm font-medium text-[#102f36] hover:bg-[#edf6f5]"
      aria-pressed={enabled}
    >
      <span className="flex items-center gap-2">
        {enabled ? (
          <Moon className="h-4 w-4 text-[#0b5d6b]" />
        ) : (
          <Sun className="h-4 w-4 text-[#0b5d6b]" />
        )}
        Modo noturno
      </span>
      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          enabled ? "bg-[#0b5d6b]" : "bg-[#dfe8e7]"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
