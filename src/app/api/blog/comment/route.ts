import { addComment, getComments } from "@/lib/blog-db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  if (!postId) return Response.json({ error: "postId required" }, { status: 400 });
  const comments = await getComments(postId);
  return Response.json({ comments });
}

export async function POST(request: NextRequest) {
  const { postId, content, parentId, author_id } = await request.json();
  if (!postId || !content || !author_id) return Response.json({ error: "postId, content, author_id required" }, { status: 400 });
  const id = await addComment(postId, author_id, content, parentId);
  return Response.json({ id });
}
