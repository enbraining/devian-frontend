"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import type { PostDetail } from "@/lib/blog-db";
import { IconHeart, IconHeartFilled, IconMessage } from "@tabler/icons-react";
import CommentSection from "./CommentSection";
import "highlight.js/styles/github-dark.css";

export default function PostDetailComponent({ post }: { post: PostDetail }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);

  async function handleLike() {
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
  }

  return (
    <article className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {post.tags.map((tag) => (
            <span key={tag.slug} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs text-gray-500 dark:text-zinc-400">
              {tag.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">{post.title}</h1>

        <div className="flex items-center gap-2.5">
          <Link href={`/blog/u/${post.author.username}`}>
            {post.author.avatar_url && (
              <Image src={post.author.avatar_url} alt={post.author.name ?? post.author.username} width={32} height={32} className="rounded-full" />
            )}
          </Link>
          <div>
            <Link href={`/blog/u/${post.author.username}`} className="text-sm font-medium text-gray-700 dark:text-zinc-300 hover:underline">
              {post.author.name ?? post.author.username}
            </Link>
            <p className="text-xs text-gray-400 dark:text-zinc-500">
              {post.published_at && formatDistanceToNow(new Date(post.published_at), { addSuffix: true, locale: ko })}
            </p>
          </div>
        </div>
      </header>

      {/* Cover */}
      {post.cover_url && (
        <div className="rounded-2xl overflow-hidden aspect-video bg-gray-100 dark:bg-zinc-900">
          <Image src={post.cover_url} alt={post.title} width={800} height={450} className="object-cover w-full h-full" />
        </div>
      )}

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none prose-pre:bg-zinc-900 prose-pre:text-sm prose-code:text-sm prose-headings:font-bold">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug, rehypeRaw]}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 py-4 border-t border-gray-100 dark:border-zinc-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            liked
              ? "border-red-200 text-red-500 bg-red-50 dark:bg-red-950/20"
              : "border-gray-200 dark:border-zinc-700 text-gray-400 hover:text-red-500"
          }`}
        >
          {liked ? <IconHeartFilled size={16} /> : <IconHeart size={16} stroke={1.5} />}
          {likeCount}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 transition-colors"
        >
          <IconMessage size={16} stroke={1.5} />
          댓글 {post.comment_count}
        </button>
      </div>

      {showComments && <CommentSection postId={post.id} />}
    </article>
  );
}
