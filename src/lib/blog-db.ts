import { createClient } from "@supabase/supabase-js";
import slugify from "slugify";

function supabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  published_at: string;
  view_count: number;
  author: { username: string; name: string | null; avatar_url: string | null };
  tags: { name: string; slug: string }[];
  like_count: number;
  comment_count: number;
};

export type PostDetail = PostSummary & {
  content: string;
  series: { id: string; title: string; slug: string } | null;
  series_order: number | null;
};

export type BlogUser = {
  id: string;
  username: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  github_url: string | null;
  created_at: string;
};

const POST_SELECT = `
  id, slug, title, excerpt, cover_url, published_at, view_count,
  author:blog_users!author_id(username, name, avatar_url),
  tags:blog_post_tags(tag:blog_tags(name, slug)),
  likes:blog_likes(count),
  comments:blog_comments(count)
`;

function mapPost(row: Record<string, unknown>): PostSummary {
  const tags = ((row.tags as { tag: { name: string; slug: string } }[]) ?? []).map((t) => t.tag);
  const like_count = (row.likes as { count: number }[])?.[0]?.count ?? 0;
  const comment_count = (row.comments as { count: number }[])?.[0]?.count ?? 0;
  return { ...(row as unknown as PostSummary), tags, like_count, comment_count };
}

export async function getLatestPosts(page = 1, limit = 20): Promise<PostSummary[]> {
  const db = supabase();
  const offset = (page - 1) * limit;
  const { data } = await db
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []).map((r) => mapPost(r as Record<string, unknown>));
}

export async function getPopularPosts(page = 1, limit = 20): Promise<PostSummary[]> {
  const db = supabase();
  const offset = (page - 1) * limit;
  const { data } = await db
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("is_published", true)
    .order("view_count", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []).map((r) => mapPost(r as Record<string, unknown>));
}

export async function getFollowingPosts(userId: string, page = 1, limit = 20): Promise<PostSummary[]> {
  const db = supabase();
  const { data: follows } = await db
    .from("blog_follows")
    .select("following_id")
    .eq("follower_id", userId);
  const ids = (follows ?? []).map((f) => (f as { following_id: string }).following_id);
  if (ids.length === 0) return [];
  const offset = (page - 1) * limit;
  const { data } = await db
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("is_published", true)
    .in("author_id", ids)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);
  return (data ?? []).map((r) => mapPost(r as Record<string, unknown>));
}

export async function getPost(slug: string): Promise<PostDetail | null> {
  const db = supabase();
  const { data } = await db
    .from("blog_posts")
    .select(`
      ${POST_SELECT},
      content,
      series:blog_series!series_id(id, title, slug),
      series_order
    `)
    .eq("slug", slug)
    .single();
  if (!data) return null;
  const r = data as Record<string, unknown>;
  const base = mapPost(r);
  return {
    ...base,
    content: r.content as string,
    series: r.series as PostDetail["series"],
    series_order: r.series_order as number | null,
  };
}

export async function getUserByUsername(username: string): Promise<BlogUser | null> {
  const db = supabase();
  const { data } = await db.from("blog_users").select("*").eq("username", username).single();
  return (data as BlogUser) ?? null;
}

export async function getUserPosts(userId: string, publishedOnly = true): Promise<PostSummary[]> {
  const db = supabase();
  let query = db
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (publishedOnly) query = query.eq("is_published", true);
  const { data } = await query;
  return (data ?? []).map((r) => mapPost(r as Record<string, unknown>));
}

export async function upsertPost(
  post: {
    id?: string;
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    cover_url?: string;
    author_id: string;
    is_published: boolean;
    series_id?: string | null;
    series_order?: number | null;
    published_at?: string | null;
  },
  tagNames: string[]
): Promise<string> {
  const db = adminSupabase();
  const published_at =
    post.is_published && !post.published_at ? new Date().toISOString() : post.published_at ?? null;

  const { data, error } = await db
    .from("blog_posts")
    .upsert({ ...post, published_at, updated_at: new Date().toISOString() }, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const postId = (data as { id: string }).id;

  const tagIds: string[] = [];
  for (const name of tagNames) {
    const tagSlug = slugify(name, { lower: true, strict: true });
    const { data: tag } = await db
      .from("blog_tags")
      .upsert({ name, slug: tagSlug }, { onConflict: "slug" })
      .select("id")
      .single();
    if (tag) tagIds.push((tag as { id: string }).id);
  }

  await db.from("blog_post_tags").delete().eq("post_id", postId);
  if (tagIds.length > 0) {
    await db.from("blog_post_tags").insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
  }

  return postId;
}

export async function deletePost(postId: string, authorId: string): Promise<void> {
  const db = adminSupabase();
  await db.from("blog_posts").delete().eq("id", postId).eq("author_id", authorId);
}

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const db = adminSupabase();
  const { data: existing } = await db
    .from("blog_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();
  if (existing) {
    await db.from("blog_likes").delete().eq("post_id", postId).eq("user_id", userId);
    return false;
  } else {
    await db.from("blog_likes").insert({ post_id: postId, user_id: userId });
    return true;
  }
}

export async function getComments(postId: string) {
  const db = supabase();
  const { data } = await db
    .from("blog_comments")
    .select("id, content, created_at, parent_id, author:blog_users!author_id(username, name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function addComment(
  postId: string,
  authorId: string,
  content: string,
  parentId?: string
): Promise<string> {
  const db = adminSupabase();
  const { data, error } = await db
    .from("blog_comments")
    .insert({ post_id: postId, author_id: authorId, content, parent_id: parentId ?? null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  const db = adminSupabase();
  const { data: existing } = await db
    .from("blog_follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .single();
  if (existing) {
    await db.from("blog_follows").delete().eq("follower_id", followerId).eq("following_id", followingId);
    return false;
  } else {
    await db.from("blog_follows").insert({ follower_id: followerId, following_id: followingId });
    return true;
  }
}

export function makeSlug(title: string): string {
  return slugify(title, { lower: true, strict: true }) + "-" + Math.random().toString(36).slice(2, 7);
}
