import { getPost } from "@/lib/blog-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import PostEditor from "@/components/blog/PostEditor";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/blog/login");

  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <PostEditor
        initialData={{
          slug: post.slug,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt ?? undefined,
          cover_url: post.cover_url ?? undefined,
          tags: post.tags.map((t) => t.name),
          is_published: !!post.published_at,
        }}
      />
    </div>
  );
}
