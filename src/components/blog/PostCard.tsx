import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { PostSummary } from "@/lib/blog-db";
import { IconHeart, IconMessage } from "@tabler/icons-react";

export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-sm transition-all overflow-hidden">
      <Link href={`/blog/${post.slug}`} className="block p-5">
        <div className="flex gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Author */}
            <div className="flex items-center gap-2">
              {post.author.avatar_url && (
                <Image
                  src={post.author.avatar_url}
                  alt={post.author.name ?? post.author.username}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              )}
              <span className="text-xs text-gray-400 dark:text-zinc-500">
                {post.author.name ?? post.author.username}
              </span>
              {post.published_at && (
                <>
                  <span className="text-gray-200 dark:text-zinc-700">·</span>
                  <span className="text-xs text-gray-300 dark:text-zinc-600">
                    {formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: ko })}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Tags + stats */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex gap-1.5 flex-1 flex-wrap">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.slug}
                    className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs text-gray-500 dark:text-zinc-400"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300 dark:text-zinc-600 flex-shrink-0">
                <span className="flex items-center gap-1">
                  <IconHeart size={12} stroke={1.5} />
                  {post.like_count}
                </span>
                <span className="flex items-center gap-1">
                  <IconMessage size={12} stroke={1.5} />
                  {post.comment_count}
                </span>
              </div>
            </div>
          </div>

          {/* Cover image */}
          {post.cover_url && (
            <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800">
              <Image src={post.cover_url} alt={post.title} width={96} height={96} className="object-cover w-full h-full" />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
