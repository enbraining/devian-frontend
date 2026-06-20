import { createClient } from "@supabase/supabase-js";

export type Article = {
  id: string;
  blog_id: string;
  title: string;
  url: string;
  published_at: string;
  summary: string | null;
  thumbnail: string | null;
  tags: string[];
  created_at: string;
};

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

export const supabase = {
  from: (...args: Parameters<ReturnType<typeof getSupabase>["from"]>) =>
    getSupabase().from(...args),
};
