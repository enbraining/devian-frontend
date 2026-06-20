import { upsertPost, deletePost, makeSlug } from "@/lib/blog-db";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, cover_url, is_published, tags = [], series_id, series_order, slug: existingSlug, author_id } = body;
    if (!title || !content || !author_id) return Response.json({ error: "title, content, author_id required" }, { status: 400 });

    const slug = existingSlug ?? makeSlug(title);

    const postId = await upsertPost(
      {
        slug,
        title,
        content,
        excerpt: content.slice(0, 200).replace(/[#*`]/g, "").trim(),
        cover_url: cover_url || undefined,
        author_id,
        is_published: !!is_published,
        series_id: series_id ?? null,
        series_order: series_order ?? null,
      },
      tags
    );

    return Response.json({ postId, slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[POST /api/blog/post]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { postId, author_id } = await request.json();
    if (!postId || !author_id) return Response.json({ error: "postId and author_id required" }, { status: 400 });
    await deletePost(postId, author_id);
    return Response.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
