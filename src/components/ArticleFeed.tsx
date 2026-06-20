"use client";

import { useState, useEffect, useCallback } from "react";
import { IconMailboxOff } from "@tabler/icons-react";
import { Article } from "@/lib/supabase";
import ArticleCard from "./ArticleCard";
import BlogFilter from "./BlogFilter";
import TagFilter from "./TagFilter";

interface TagItem {
  tag: string;
  count: number;
}

export default function ArticleFeed() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedBlog, setSelectedBlog] = useState("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => setTags(d.tags ?? []));
  }, []);

  const fetchArticles = useCallback(
    async (blogId: string, tag: string | null, p: number, append = false) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(p) });
        if (blogId !== "all") params.set("blog", blogId);
        if (tag) params.set("tag", tag);
        const res = await fetch(`/api/articles?${params}`);
        const data = await res.json();
        if (append) {
          setArticles((prev) => [...prev, ...(data.articles ?? [])]);
        } else {
          setArticles(data.articles ?? []);
        }
        setTotal(data.total ?? 0);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    []
  );

  useEffect(() => {
    setPage(1);
    fetchArticles(selectedBlog, selectedTag, 1);
  }, [selectedBlog, selectedTag, fetchArticles]);

  const handleBlogChange = (id: string) => {
    setSelectedBlog(id);
    setSelectedTag(null);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchArticles(selectedBlog, selectedTag, next, true);
  };

  const hasMore = articles.length < total;

  return (
    <div className="flex flex-col gap-5">
      <BlogFilter selected={selectedBlog} onChange={handleBlogChange} />
      <TagFilter tags={tags} selected={selectedTag} onChange={setSelectedTag} />

      {initialLoad ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <IconMailboxOff size={40} stroke={1.5} />
          <p className="text-sm">아직 수집된 아티클이 없습니다.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400">총 {total.toLocaleString()}개</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id ?? article.url} article={article} />
            ))}
          </div>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="self-center px-6 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              {loading ? "불러오는 중..." : "더 보기"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
