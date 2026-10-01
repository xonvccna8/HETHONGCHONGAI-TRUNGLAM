"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("origin-theme");
    const enabled = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", enabled);
    const timeout = window.setTimeout(() => setDark(enabled), 0);
    return () => window.clearTimeout(timeout);
  }, []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("origin-theme", next ? "dark" : "light");
  }
  return (
    <button onClick={toggle} className="focus-ring grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)]" aria-label={dark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
