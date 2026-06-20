import { upsertPost, deletePost, makeSlug } from "@/lib/blog-db";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content, excerpt, cover_url, is_published, tags = [], series_id, series_order, slug: existingSlug, author_id } = body;
  if (!title || !content || !author_id) return Response.json({ error: "title, content, author_id required" }, { status: 400 });

  const slug = existingSlug ?? makeSlug(title);

  const postId = await upsertPost(
    {
      slug,
      title,
      content,
      excerpt: excerpt || content.slice(0, 200).replace(/[#*`]/g, "").trim(),
      cover_url: cover_url || undefined,
      author_id,
      is_published: !!is_published,
      series_id: series_id ?? null,
      series_order: series_order ?? null,
    },
    tags
  );

  return Response.json({ postId, slug });
}

export async function DELETE(request: NextRequest) {
  const { postId, author_id } = await request.json();
  if (!postId || !author_id) return Response.json({ error: "postId and author_id required" }, { status: 400 });
  await deletePost(postId, author_id);
  return Response.json({ ok: true });
}
