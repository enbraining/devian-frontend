"use client";

import { IconX } from "@tabler/icons-react";

interface TagItem {
  tag: string;
  count: number;
}

interface Props {
  tags: TagItem[];
  selected: string | null;
  onChange: (tag: string | null) => void;
}

export default function TagFilter({ tags, selected, onChange }: Props) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => onChange(selected === tag ? null : tag)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selected === tag
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-700"
          }`}
        >
          {tag}
          <span className={`ml-1 ${selected === tag ? "text-blue-200" : "text-gray-400"}`}>
            {count}
          </span>
        </button>
      ))}

      {selected && (
        <button
          onClick={() => onChange(null)}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-400 dark:border-zinc-600 dark:text-zinc-500 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors"
        >
          <IconX size={11} stroke={2} />
          필터 해제
        </button>
      )}
    </div>
  );
}
