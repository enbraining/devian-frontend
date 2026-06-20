import { upsertPost, deletePost, makeSlug } from "@/lib/blog-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, content, excerpt, cover_url, is_published, tags = [], series_id, series_order, slug: existingSlug } = body;
  if (!title || !content) return Response.json({ error: "title and content required" }, { status: 400 });

  const slug = existingSlug ?? makeSlug(title);

  const postId = await upsertPost(
    {
      slug,
      title,
      content,
      excerpt: excerpt || content.slice(0, 200).replace(/[#*`]/g, "").trim(),
      cover_url: cover_url || undefined,
      author_id: session.user.id,
      is_published: !!is_published,
      series_id: series_id ?? null,
      series_order: series_order ?? null,
    },
    tags
  );

  return Response.json({ postId, slug });
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await request.json();
  await deletePost(postId, session.user.id);
  return Response.json({ ok: true });
}
