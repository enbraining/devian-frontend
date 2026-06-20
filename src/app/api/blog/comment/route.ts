import { addComment, getComments } from "@/lib/blog-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");
  if (!postId) return Response.json({ error: "postId required" }, { status: 400 });
  const comments = await getComments(postId);
  return Response.json({ comments });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId, content, parentId } = await request.json();
  if (!postId || !content) return Response.json({ error: "postId and content required" }, { status: 400 });

  const id = await addComment(postId, session.user.id, content, parentId);
  return Response.json({ id });
}
