"use client";

import { signIn } from "next-auth/react";
import { IconBrandGithub } from "@tabler/icons-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">DEVIAN 블로그</h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500">개발자를 위한 블로그 플랫폼</p>
        </div>
        <button
          onClick={() => signIn("github", { callbackUrl: "/blog" })}
          className="flex items-center gap-2 w-full justify-center px-5 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          <IconBrandGithub size={18} stroke={1.5} />
          GitHub으로 로그인
        </button>
      </div>
    </div>
  );
}
