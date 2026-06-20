import { getPost } from "@/lib/blog-db";
import { notFound } from "next/navigation";
import PostDetail from "@/components/blog/PostDetail";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: `${post.title} — DEVIAN`, description: post.excerpt ?? undefined };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <PostDetail post={post} />
      </main>
    </div>
  );
}
