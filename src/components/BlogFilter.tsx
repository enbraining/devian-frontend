"use client";

import { BLOG_SOURCES } from "@/lib/blogs";
import Image from "next/image";

interface Props {
  selected: string;
  onChange: (id: string) => void;
}

export default function BlogFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
          selected === "all"
            ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
            : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700"
        }`}
      >
        전체
      </button>
      {BLOG_SOURCES.map((blog) => (
        <button
          key={blog.id}
          onClick={() => onChange(blog.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            selected === blog.id
              ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900 dark:border-white"
              : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700"
          }`}
        >
          <Image
            src={blog.logoUrl}
            alt={blog.name}
            width={16}
            height={16}
            className="rounded-sm"
          />
          {blog.name}
        </button>
      ))}
    </div>
  );
}
