import { toggleLike } from "@/lib/blog-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { postId } = await request.json();
  const liked = await toggleLike(postId, session.user.id);
  return Response.json({ liked });
}
