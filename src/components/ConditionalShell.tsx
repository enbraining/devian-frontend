"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

// 에디터 페이지에서는 헤더·푸터 숨김
const EDITOR_PATHS = ["/blog/write"];

function isEditorPath(pathname: string) {
  if (EDITOR_PATHS.includes(pathname)) return true;
  // /blog/[slug]/edit
  if (/^\/blog\/.+\/edit$/.test(pathname)) return true;
  return false;
}

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const editor = isEditorPath(pathname);

  if (editor) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-gray-100 dark:border-zinc-800 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400 dark:text-zinc-600">
          <span>© {new Date().getFullYear()} DEVIAN. All rights reserved.</span>
          <a href="mailto:enbraining@gmail.com" className="hover:text-gray-600 dark:hover:text-zinc-400 transition-colors">
            enbraining@gmail.com
          </a>
        </div>
      </footer>
    </>
  );
}
