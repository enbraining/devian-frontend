import { getUser } from "@/lib/auth-server";
import { getPost } from "@/lib/blog-db";
import { notFound, redirect } from "next/navigation";
import PostEditor from "@/components/blog/PostEditor";

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getUser();
  if (!user) redirect("/blog/login");

  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <PostEditor
      authorId={user.id}
      initialData={{
        slug: post.slug,
        title: post.title,
        content: post.content,
        cover_url: post.cover_url ?? undefined,
        tags: post.tags.map((t) => t.name),
        is_published: !!post.published_at,
      }}
    />
  );
}
