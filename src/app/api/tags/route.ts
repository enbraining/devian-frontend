import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("articles")
    .select("tags");

  if (error) return Response.json({ tags: [] });

  const tagCount: Record<string, number> = {};
  for (const row of data ?? []) {
    for (const tag of row.tags ?? []) {
      tagCount[tag] = (tagCount[tag] ?? 0) + 1;
    }
  }

  const tags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));

  return Response.json({ tags });
}
