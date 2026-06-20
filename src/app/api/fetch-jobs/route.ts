import { fetchAndSaveJobs } from "@/lib/job-fetcher";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await fetchAndSaveJobs();
  return Response.json({ ok: true, results });
}
