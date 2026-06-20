import { getSupabaseServer } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 30;
  const offset = (page - 1) * limit;

  const supabase = getSupabaseServer();
  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .order("posted_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (company && company !== "all") {
    query = query.eq("company_id", company);
  }

  const { data, count, error } = await query;

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ jobs: data ?? [], total: count ?? 0 });
}
