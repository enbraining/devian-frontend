"use client";

import { useState } from "react";

export default function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRefresh = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/fetch-articles");
      const data = await res.json();
      const total = (data.results ?? []).reduce(
        (sum: number, r: { count: number }) => sum + r.count,
        0
      );
      setResult(`${total}개 아티클 수집 완료`);
      setTimeout(() => setResult(null), 3000);
      window.location.reload();
    } catch {
      setResult("오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-xs text-green-600 dark:text-green-400">{result}</span>
      )}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        <span className={loading ? "animate-spin" : ""}>↻</span>
        {loading ? "수집 중..." : "새로고침"}
      </button>
    </div>
  );
}
