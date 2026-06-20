"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { JOB_SOURCES } from "@/lib/job-sources";
import { IconBriefcase, IconMapPin, IconBuilding, IconExternalLink } from "@tabler/icons-react";
import { JobCardSkeleton } from "./skeletons";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { cacheGet, cacheSet } from "@/lib/client-cache";

interface Job {
  id: string;
  company_id: string;
  title: string;
  url: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  posted_at: string | null;
}

interface CachedState { jobs: Job[]; total: number; page: number; selectedCompany: string; }

export default function JobFeed() {
  const cached = cacheGet<CachedState>("job-feed");

  const [jobs, setJobs] = useState<Job[]>(cached?.jobs ?? []);
  const [selectedCompany, setSelectedCompany] = useState(cached?.selectedCompany ?? "all");
  const [page, setPage] = useState(cached?.page ?? 1);
  const [total, setTotal] = useState(cached?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(!cached);

  const fetchJobs = useCallback(async (company: string, p: number, append = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (company !== "all") params.set("company", company);
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      const newJobs = data.jobs ?? [];
      const newTotal = data.total ?? 0;
      setJobs((prev) => {
        const next = append ? [...prev, ...newJobs] : newJobs;
        cacheSet<CachedState>("job-feed", { jobs: next, total: newTotal, page: p, selectedCompany: company });
        return next;
      });
      setTotal(newTotal);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (cached) return;
    }
    setPage(1);
    fetchJobs(selectedCompany, 1);
  }, [selectedCompany]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchJobs(selectedCompany, next, true);
  };

  const hasMore = jobs.length < total;

  return (
    <div className="flex flex-col gap-5">
      {/* Company filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCompany("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            selectedCompany === "all"
              ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700"
          }`}
        >
          전체
        </button>
        {JOB_SOURCES.map((source) => (
          <button
            key={source.id}
            onClick={() => setSelectedCompany(source.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              selectedCompany === source.id
                ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700"
            }`}
          >
            <Image src={source.logoUrl} alt={source.name} width={16} height={16} className="rounded-sm" />
            {source.name}
          </button>
        ))}
      </div>

      {initialLoad ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <IconBriefcase size={40} stroke={1.5} />
          <p className="text-sm">수집된 채용공고가 없습니다.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400">총 {total.toLocaleString()}개</p>
          <div className="flex flex-col gap-2">
            {jobs.map((job) => {
              const source = JOB_SOURCES.find((s) => s.id === job.company_id);
              return (
                <a
                  key={job.id}
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 px-5 py-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm transition-all"
                >
                  {/* Logo */}
                  {source && (
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
                      <Image src={source.logoUrl} alt={source.name} width={28} height={28} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                      {job.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {source && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <IconBuilding size={12} stroke={1.5} />
                          {source.name}
                        </span>
                      )}
                      {job.department && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <IconBriefcase size={12} stroke={1.5} />
                          {job.department}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <IconMapPin size={12} stroke={1.5} />
                          {job.location}
                        </span>
                      )}
                      {job.posted_at && (
                        <span className="text-xs text-gray-300 dark:text-zinc-600">
                          {formatDistanceToNow(new Date(job.posted_at), { addSuffix: true, locale: ko })}
                        </span>
                      )}
                    </div>
                  </div>

                  <IconExternalLink size={16} stroke={1.5} className="flex-shrink-0 text-gray-300 dark:text-zinc-600 group-hover:text-blue-400 transition-colors" />
                </a>
              );
            })}
          </div>

          {hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="self-center px-6 py-2 rounded-full border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-zinc-300 hover:border-gray-400 transition-colors disabled:opacity-50"
            >
              {loading ? "불러오는 중..." : "더 보기"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
