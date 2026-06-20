"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IconMailboxOff, IconLoader2, IconLayoutGrid, IconLayoutList, IconLayoutRows } from "@tabler/icons-react";
import { ArticleCardSkeleton, ArticleCardListSkeleton, ArticleCardLargeSkeleton } from "./skeletons";
import { Article } from "@/lib/supabase";
import ArticleCard from "./ArticleCard";
import BlogFilter from "./BlogFilter";
import TagFilter from "./TagFilter";
import { cacheGet, cacheSet } from "@/lib/client-cache";

interface TagItem { tag: string; count: number; }

interface CachedState {
  articles: Article[];
  total: number;
  page: number;
  selectedBlog: string;
  selectedTag: string | null;
  tags: TagItem[];
}

const CACHE_KEY = "article-feed";

export default function ArticleFeed() {
  const cached = cacheGet<CachedState>(CACHE_KEY);

  const [articles, setArticles] = useState<Article[]>(cached?.articles ?? []);
  const [selectedBlog, setSelectedBlog] = useState(cached?.selectedBlog ?? "all");
  const [selectedTag, setSelectedTag] = useState<string | null>(cached?.selectedTag ?? null);
  const [tags, setTags] = useState<TagItem[]>(cached?.tags ?? []);
  const [page, setPage] = useState(cached?.page ?? 1);
  const [total, setTotal] = useState(cached?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(!cached);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "large">(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("article-view") as "grid" | "list" | "large") ?? "grid";
  });

  function changeViewMode(mode: "grid" | "list" | "large") {
    setViewMode(mode);
    localStorage.setItem("article-view", mode);
  }
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 태그 목록 — 캐시 없을 때만 fetch
  useEffect(() => {
    if (cached?.tags?.length) return;
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags ?? []));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchArticles = useCallback(
    async (blogId: string, tag: string | null, p: number, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (blogId !== "all") params.set("blog", blogId);
        if (tag) params.set("tag", tag);
        const res = await fetch(`/api/articles?${params}`);
        const data = await res.json();
        const newArticles = data.articles ?? [];
        const newTotal = data.total ?? 0;

        setArticles((prev) => {
          const next = append ? [...prev, ...newArticles] : newArticles;
          cacheSet<CachedState>(CACHE_KEY, {
            articles: next, total: newTotal, page: p,
            selectedBlog: blogId, selectedTag: tag, tags,
          });
          return next;
        });
        setTotal(newTotal);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [tags]
  );

  // 필터가 바뀌면 재요청 (캐시된 상태와 다를 때만)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (cached) return; // 캐시 있으면 최초 fetch 건너뜀
    }
    setPage(1);
    fetchArticles(selectedBlog, selectedTag, 1);
  }, [selectedBlog, selectedTag]); // eslint-disable-line react-hooks/exhaustive-deps

  // IntersectionObserver
  const hasMore = articles.length < total;
  const hasMoreRef = useRef(hasMore);
  const loadingRef = useRef(loading);
  const pageRef = useRef(page);
  hasMoreRef.current = hasMore;
  loadingRef.current = loading;
  pageRef.current = page;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          const next = pageRef.current + 1;
          setPage(next);
          fetchArticles(selectedBlog, selectedTag, next, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [selectedBlog, selectedTag, fetchArticles]);

  const handleBlogChange = (id: string) => {
    setSelectedBlog(id);
    setSelectedTag(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <BlogFilter selected={selectedBlog} onChange={handleBlogChange} />
      <TagFilter tags={tags} selected={selectedTag} onChange={setSelectedTag} />

      {initialLoad ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : viewMode === "list" ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 8 }).map((_, i) => <ArticleCardListSkeleton key={i} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <ArticleCardLargeSkeleton key={i} />)}
          </div>
        )
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <IconMailboxOff size={40} stroke={1.5} />
          <p className="text-sm">아직 수집된 아티클이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">총 {total.toLocaleString()}개</p>
            <div className="hidden sm:flex items-center gap-0.5 bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5">
              {([
                { mode: "grid", icon: IconLayoutGrid, label: "그리드" },
                { mode: "list", icon: IconLayoutList, label: "리스트" },
                { mode: "large", icon: IconLayoutRows, label: "큰 리스트" },
              ] as const).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => changeViewMode(mode)}
                  className={`p-1.5 rounded-md transition-colors ${viewMode === mode ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  title={label}
                >
                  <Icon size={14} stroke={1.5} />
                </button>
              ))}
            </div>
          </div>
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-3"}>
            {articles.map((article) => (
              <ArticleCard key={article.id ?? article.url} article={article} layout={viewMode} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center pt-2">
              <button
                onClick={() => {
                  if (!loading) {
                    const next = page + 1;
                    setPage(next);
                    fetchArticles(selectedBlog, selectedTag, next, true);
                  }
                }}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:border-gray-400 transition-colors disabled:opacity-60"
              >
                더 보기
                {loading && <IconLoader2 size={14} stroke={2} className="animate-spin" />}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
