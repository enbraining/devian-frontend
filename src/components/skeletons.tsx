// 공통 pulse 블록
function S({ className }: { className: string }) {
  return <div className={`bg-gray-100 dark:bg-zinc-800 animate-pulse rounded ${className}`} />;
}

// 아티클 카드 — 그리드
export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
      <S className="w-full h-44 rounded-none" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <S className="w-4 h-4 rounded-sm" />
            <S className="w-16 h-3" />
          </div>
          <S className="w-12 h-3" />
        </div>
        <S className="w-full h-4" />
        <S className="w-4/5 h-4" />
        <S className="w-full h-3 mt-1" />
        <S className="w-2/3 h-3" />
        <div className="flex gap-1 mt-1">
          <S className="w-10 h-4 rounded" />
          <S className="w-10 h-4 rounded" />
        </div>
      </div>
    </div>
  );
}

// 아티클 카드 — 리스트
export function ArticleCardListSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-4">
      <S className="w-20 h-20 flex-shrink-0 rounded-lg" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <S className="w-14 h-3 rounded-sm" />
          <S className="w-10 h-3" />
        </div>
        <S className="w-full h-4" />
        <S className="w-3/4 h-3" />
        <div className="flex gap-1">
          <S className="w-10 h-4 rounded" />
          <S className="w-10 h-4 rounded" />
        </div>
      </div>
    </div>
  );
}

// 블로그 포스트 카드 — 리스트
export function PostCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5">
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <S className="w-5 h-5 rounded-full" />
            <S className="w-20 h-3" />
            <S className="w-16 h-3" />
          </div>
          <S className="w-full h-5" />
          <S className="w-4/5 h-5" />
          <S className="w-full h-3" />
          <S className="w-2/3 h-3" />
          <div className="flex items-center gap-2 mt-1">
            <S className="w-12 h-4 rounded-md" />
            <S className="w-12 h-4 rounded-md" />
          </div>
        </div>
        <S className="flex-shrink-0 w-24 h-24 rounded-xl" />
      </div>
    </div>
  );
}

// 블로그 포스트 카드 — 그리드
export function PostCardGridSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden flex flex-col">
      <S className="w-full h-40 rounded-none" />
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-center gap-2">
          <S className="w-4 h-4 rounded-full" />
          <S className="w-16 h-3" />
        </div>
        <S className="w-full h-4" />
        <S className="w-4/5 h-4" />
        <S className="w-full h-3" />
        <S className="w-2/3 h-3" />
      </div>
    </div>
  );
}

// 채용 카드
export function JobCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800">
      <S className="flex-shrink-0 w-9 h-9 rounded-lg" />
      <div className="flex-1 flex flex-col gap-2">
        <S className="w-3/4 h-4" />
        <div className="flex gap-3">
          <S className="w-16 h-3" />
          <S className="w-20 h-3" />
          <S className="w-14 h-3" />
        </div>
      </div>
      <S className="w-4 h-4 rounded flex-shrink-0" />
    </div>
  );
}
