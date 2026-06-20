"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";

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
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "dark" : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchUsername(data.user.id, supabase);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUsername(session.user.id, supabase);
      else setUsername("");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchUsername(userId: string, supabase: ReturnType<typeof createClient>) {
    const { data } = await supabase.from("blog_users").select("username").eq("id", userId).single();
    if (data) setUsername(data.username);
  }

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
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

        {/* Right: dark mode + auth */}
        <div className="justify-self-end flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-label="다크모드 전환"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {dark ? <IconSun size={16} stroke={1.5} /> : <IconMoon size={16} stroke={1.5} />}
          </button>

          {user ? (
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-zinc-300 ring-2 ring-gray-200 dark:ring-zinc-700 overflow-hidden">
                {username?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
              </button>
              <div className="absolute right-0 top-10 w-44 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  대시보드
                </Link>
                <Link href="/blog/write" className="block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  글쓰기
                </Link>
                {username && (
                  <Link href={`/blog/u/${username}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                    내 블로그
                  </Link>
                )}
                <hr className="my-1 border-gray-100 dark:border-zinc-800" />
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-zinc-800"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/blog/login"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
