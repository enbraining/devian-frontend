import { JOB_SOURCES, JobSource } from "./job-sources";
import { getSupabaseServer } from "./supabase-server";

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  departments: { name: string }[];
  offices: { name: string }[];
  updated_at: string;
  metadata?: { name: string; value: string }[];
}

interface GreenhouseResponse {
  jobs: GreenhouseJob[];
}

async function fetchGreenhouse(source: JobSource) {
  const res = await fetch(
    `https://boards-api.greenhouse.io/v1/boards/${source.slug}/jobs`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`Greenhouse ${source.slug} ${res.status}`);
  const data: GreenhouseResponse = await res.json();

  let jobs = data.jobs ?? [];

  if (source.departmentFilter?.length) {
    const filters = source.departmentFilter.map((f) => f.toLowerCase());
    jobs = jobs.filter((job) => {
      const dept = job.departments?.[0]?.name?.toLowerCase() ?? "";
      const title = job.title.toLowerCase();
      return filters.some((f) => dept.includes(f) || title.includes(f));
    });
  }

  return jobs.map((job) => ({
    company_id: source.id,
    title: job.title,
    url: job.absolute_url,
    department: job.departments?.[0]?.name ?? null,
    location: job.offices?.[0]?.name ?? null,
    employment_type: null,
    posted_at: job.updated_at ? new Date(job.updated_at).toISOString() : null,
  }));
}

export async function fetchAndSaveJobs() {
  const supabase = getSupabaseServer();
  const results: { companyId: string; count: number; error?: string }[] = [];

  for (const source of JOB_SOURCES) {
    try {
      const jobs = await fetchGreenhouse(source);
      if (jobs.length === 0) {
        results.push({ companyId: source.id, count: 0 });
        continue;
      }

      const { error } = await supabase
        .from("jobs")
        .upsert(jobs, { onConflict: "url", ignoreDuplicates: false });

      if (error) {
        results.push({ companyId: source.id, count: 0, error: error.message });
      } else {
        results.push({ companyId: source.id, count: jobs.length });
      }
    } catch (e) {
      results.push({ companyId: source.id, count: 0, error: String(e) });
    }
  }

  return results;
}
