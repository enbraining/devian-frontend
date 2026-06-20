import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import Header from "@/components/Header";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "DEVIAN",
  description: "국내 테크 기업 블로그 모아보기",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${spaceMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
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
        </SessionProvider>
      </body>
    </html>
  );
}
