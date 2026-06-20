import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { PostSummary } from "@/lib/blog-db";
import { IconHeart, IconMessage } from "@tabler/icons-react";

interface Props {
  post: PostSummary;
  layout?: "grid" | "list" | "large";
}

export default function PostCard({ post, layout = "list" }: Props) {
  const timeAgo = post.published_at
    ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: ko })
    : null;

  const stats = (
    <div className="flex items-center gap-2.5 text-xs text-gray-300 dark:text-zinc-600 flex-shrink-0">
      <span className="flex items-center gap-1"><IconHeart size={12} stroke={1.5} />{post.like_count}</span>
      <span className="flex items-center gap-1"><IconMessage size={12} stroke={1.5} />{post.comment_count}</span>
    </div>
  );

  const authorRow = (size: number = 16) => (
    <div className="flex items-center gap-1.5">
      {post.author.avatar_url && (
        <Image src={post.author.avatar_url} alt={post.author.name ?? post.author.username} width={size} height={size} className="rounded-full" />
      )}
      <span className="text-xs font-medium text-gray-500 dark:text-zinc-400">{post.author.name ?? post.author.username}</span>
      {timeAgo && (
        <>
          <span className="text-gray-200 dark:text-zinc-700">·</span>
          <span className="text-xs text-gray-400 dark:text-zinc-500">{timeAgo}</span>
        </>
      )}
    </div>
  );

  // 그리드 — ArticleCard grid와 동일 구조
  if (layout === "grid") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden"
      >
        <div className="relative w-full h-44 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
          {post.cover_url ? (
            <Image src={post.cover_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-200 dark:text-zinc-700 select-none">
                {post.title[0]}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          {authorRow()}
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex gap-1 flex-wrap">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag.slug} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded">#{tag.name}</span>
              ))}
            </div>
            {stats}
          </div>
        </div>
      </Link>
    );
  }

  // 리스트 — ArticleCard list와 동일 구조
  if (layout === "list") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden p-4"
      >
        <div className="relative flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden">
          {post.cover_url ? (
            <Image src={post.cover_url} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-200 dark:text-zinc-700 select-none">{post.title[0]}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {authorRow()}
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-1">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between mt-0.5">
            <div className="flex gap-1">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag.slug} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded">#{tag.name}</span>
              ))}
            </div>
            {stats}
          </div>
        </div>
      </Link>
    );
  }

  // 큰 리스트 — ArticleCard large와 동일 구조
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex gap-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden p-5"
    >
      <div className="relative flex-shrink-0 w-48 h-36 rounded-xl bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        {post.cover_url ? (
          <Image src={post.cover_url} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-200 dark:text-zinc-700 select-none">{post.title[0]}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-2 py-1">
        {authorRow(18)}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-1">
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 5).map((tag) => (
              <span key={tag.slug} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded">#{tag.name}</span>
            ))}
          </div>
          {stats}
        </div>
      </div>
    </Link>
  );
}
