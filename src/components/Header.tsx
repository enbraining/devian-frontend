"use client";

import { useEffect, useState } from "react";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function Header() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-widest text-gray-900 dark:text-white select-none" style={{ fontFamily: "var(--font-space-mono)" }}>
            DEVIAN
          </span>
          <span className="hidden sm:block text-xs text-gray-300 dark:text-gray-600">|</span>
          <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500">
            국내 테크 기업 블로그 모아보기
          </span>
        </div>

        <button
          onClick={toggleDark}
          aria-label="다크모드 전환"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {dark ? (
            <IconSun size={16} stroke={1.5} />
          ) : (
            <IconMoon size={16} stroke={1.5} />
          )}
        </button>
      </div>
    </header>
  );
}
