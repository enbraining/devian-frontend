function S({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`bg-gray-100 dark:bg-zinc-800 animate-pulse rounded ${className}`} style={style} />;
}

import React from "react";
export default function PostLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <article className="flex flex-col gap-8 max-w-3xl mx-auto">
          {/* Tags */}
          <div className="flex gap-1.5">
            <S className="w-12 h-5 rounded-md" />
            <S className="w-16 h-5 rounded-md" />
          </div>
          {/* Title */}
          <div className="flex flex-col gap-2">
            <S className="w-full h-9 rounded" />
            <S className="w-3/4 h-9 rounded" />
          </div>
          {/* Author */}
          <div className="flex items-center gap-3">
            <S className="w-10 h-10 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <S className="w-24 h-4 rounded" />
              <S className="w-32 h-3 rounded" />
            </div>
          </div>
          {/* Cover */}
          <S className="w-full h-64 rounded-xl" />
          {/* Body */}
          <div className="flex flex-col gap-3">
            {[100, 90, 95, 70, 100, 85, 60, 100, 80, 75].map((w, i) => (
              <S key={i} className={`w-[${w}%] h-4 rounded`} style={{ width: `${w}%` }} />
            ))}
            <S className="w-full h-32 rounded-xl mt-4" />
            {[100, 90, 75, 85, 100, 65].map((w, i) => (
              <S key={`b${i}`} className="h-4 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
