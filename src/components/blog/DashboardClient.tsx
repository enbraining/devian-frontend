"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { PostSummary } from "@/lib/blog-db";
import { IconPencilPlus, IconPencil, IconTrash, IconEye, IconEyeOff } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function DashboardClient({ posts: initialPosts }: { posts: PostSummary[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const router = useRouter();

  async function handleDelete(postId: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    await fetch("/api/blog/post", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  const published = posts.filter((p) => !!p.published_at);
  const drafts = posts.filter((p) => !p.published_at);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">대시보드</h1>
        <Link
          href="/blog/write"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 transition-opacity"
        >
          <IconPencilPlus size={15} stroke={2} />
          글쓰기
        </Link>
      </div>

      {drafts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">임시저장 {drafts.length}</h2>
          {drafts.map((post) => (
            <PostRow key={post.id} post={post} isDraft onDelete={handleDelete} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">발행됨 {published.length}</h2>
        {published.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">발행된 글이 없습니다.</p>
        ) : (
          published.map((post) => (
            <PostRow key={post.id} post={post} onDelete={handleDelete} />
          ))
        )}
      </section>
    </div>
  );
}

function PostRow({
  post,
  isDraft,
  onDelete,
}: {
  post: PostSummary;
  isDraft?: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {isDraft ? (
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <IconEyeOff size={12} stroke={1.5} /> 임시저장
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <IconEye size={12} stroke={1.5} /> 발행
            </span>
          )}
          {post.published_at && (
            <span className="text-xs text-gray-300 dark:text-zinc-600">
              {formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: ko })}
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{post.title}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link
          href={`/blog/${post.slug}/edit`}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <IconPencil size={15} stroke={1.5} />
        </Link>
        <button
          onClick={() => onDelete(post.id)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <IconTrash size={15} stroke={1.5} />
        </button>
      </div>
    </div>
  );
}
