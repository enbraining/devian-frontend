import { toggleLike } from "@/lib/blog-db";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { postId, userId } = await request.json();
  if (!postId || !userId) return Response.json({ error: "postId and userId required" }, { status: 400 });
  const liked = await toggleLike(postId, userId);
  return Response.json({ liked });
}
