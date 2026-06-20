import { PostCardSkeleton } from "@/components/skeletons";

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col gap-6">
          {/* Tab bar placeholder */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-36 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-7 w-16 rounded-lg bg-gray-100 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        </div>
      </main>
    </div>
  );
}
