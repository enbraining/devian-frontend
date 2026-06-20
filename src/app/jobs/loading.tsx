import { JobCardSkeleton } from "@/components/skeletons";

export default function JobsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-5">
          {/* Company filter */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: 10 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        </div>
      </main>
    </div>
  );
}
