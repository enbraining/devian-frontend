"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "./PostCard";
import type { PostSummary } from "@/lib/blog-db";
import { cacheGet, cacheSet } from "@/lib/client-cache";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { PostCardSkeleton, PostCardGridSkeleton } from "../skeletons";

type Tab = "latest" | "popular";

interface CachedState { tab: Tab; posts: PostSummary[]; }

export default function BlogFeedPage() {
  const cached = cacheGet<CachedState>("blog-feed");

  const [tab, setTab] = useState<Tab>(cached?.tab ?? "latest");
  const [posts, setPosts] = useState<PostSummary[]>(cached?.posts ?? []);
  const [loading, setLoading] = useState(!cached);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const fetchPosts = useCallback(async (t: Tab) => {
    setLoading(true);
    const res = await fetch(`/api/blog/posts?tab=${t}`);
    const data = await res.json();
    const next = data.posts ?? [];
    setPosts(next);
    cacheSet<CachedState>("blog-feed", { tab: t, posts: next });
    setLoading(false);
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (cached) return;
    }
    fetchPosts(tab);
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 dark:bg-zinc-900 rounded-full px-1 py-1">
          {(["latest", "popular"] as Tab[]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                tab === key
                  ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300"
              }`}
            >
              {key === "latest" ? "최신" : "인기"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            title="그리드"
          >
            <IconLayoutGrid size={14} stroke={1.5} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
            title="리스트"
          >
            <IconLayoutList size={14} stroke={1.5} />
          </button>
        </div>
      </div>

      {loading ? (
        viewMode === "list" ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <PostCardGridSkeleton key={i} />)}
          </div>
        )
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <p className="text-sm">아직 게시글이 없습니다.</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
          {posts.map((post) => <PostCard key={post.id} post={post} layout={viewMode} />)}
        </div>
      )}
    </div>
  );
}
