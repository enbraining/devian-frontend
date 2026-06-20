"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { IconSun, IconMoon } from "@tabler/icons-react";

const NAV = [
  { href: "/", label: "아티클" },
  { href: "/blog", label: "블로그" },
  { href: "/jobs", label: "채용" },
];

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Header() {
  const [dark, setDark] = useState(false);
  const pathname = usePathname();

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 grid grid-cols-3 items-center">
        {/* Left: logo */}
        <Link href="/" className="justify-self-start">
          <span
            className="text-base font-bold tracking-widest text-gray-900 dark:text-white select-none"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            DEVIAN
          </span>
        </Link>

        {/* Center: segmented nav */}
        <nav className="justify-self-center flex items-center gap-0.5 bg-gray-100 dark:bg-zinc-900 rounded-full px-1 py-1">
          {NAV.map(({ href, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: dark mode */}
        <div className="justify-self-end">
          <button
            onClick={toggleDark}
            aria-label="다크모드 전환"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {dark ? <IconSun size={16} stroke={1.5} /> : <IconMoon size={16} stroke={1.5} />}
          </button>
        </div>
      </div>
    </header>
  );
}
