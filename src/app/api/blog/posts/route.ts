import { getLatestPosts, getPopularPosts, getFollowingPosts } from "@/lib/blog-db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "latest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

  let posts;
  if (tab === "popular") {
    posts = await getPopularPosts(page);
  } else if (tab === "following") {
    const session = await getServerSession(authOptions);
    if (!session) return Response.json({ posts: [] });
    posts = await getFollowingPosts(session.user.id, page);
  } else {
    posts = await getLatestPosts(page);
  }

  return Response.json({ posts });
}
