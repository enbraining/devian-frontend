import { ArticleCardSkeleton } from "@/components/skeletons";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-5">
          {/* Blog filter bar */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
          {/* Tag filter */}
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 w-16 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        </div>
      </main>
    </div>
  );
}
