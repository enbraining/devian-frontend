import { getLatestPosts, getPopularPosts } from "@/lib/blog-db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "latest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

  const posts = tab === "popular"
    ? await getPopularPosts(page)
    : await getLatestPosts(page);

  return Response.json({ posts });
}
