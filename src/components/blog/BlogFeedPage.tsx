"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import PostCard from "./PostCard";
import type { PostSummary } from "@/lib/blog-db";
import { IconPencilPlus } from "@tabler/icons-react";
import Link from "next/link";

type Tab = "latest" | "popular" | "following";

export default function BlogFeedPage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("latest");
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async (t: Tab) => {
    setLoading(true);
    const res = await fetch(`/api/blog/posts?tab=${t}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts(tab);
  }, [tab, fetchPosts]);

  const TABS: { key: Tab; label: string; requiresAuth?: boolean }[] = [
    { key: "latest", label: "최신" },
    { key: "popular", label: "인기" },
    { key: "following", label: "팔로잉", requiresAuth: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 dark:bg-zinc-900 rounded-full px-1 py-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                tab === key
                  ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {session && (
          <Link
            href="/blog/write"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity"
          >
            <IconPencilPlus size={15} stroke={2} />
            글쓰기
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 dark:bg-zinc-900 animate-pulse" />
          ))}
        </div>
      ) : tab === "following" && !session ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <p className="text-sm">팔로잉 피드를 보려면 로그인이 필요합니다.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <p className="text-sm">아직 게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
