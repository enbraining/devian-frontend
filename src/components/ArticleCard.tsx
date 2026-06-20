import { Article } from "@/lib/supabase";
import { BLOG_SOURCES } from "@/lib/blogs";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import Image from "next/image";

interface Props {
  article: Article;
  layout?: "grid" | "list" | "large";
}

export default function ArticleCard({ article, layout = "grid" }: Props) {
  const blog = BLOG_SOURCES.find((b) => b.id === article.blog_id);
  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
    locale: ko,
  });

  if (layout === "list") {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden p-4"
      >
        <div className="relative flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 dark:bg-zinc-800 overflow-hidden">
          {article.thumbnail ? (
            <Image src={article.thumbnail} alt={article.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: blog ? `${blog.color}18` : "#f3f4f6" }}>
              {blog && <Image src={blog.logoUrl} alt={blog.name} width={32} height={32} className="opacity-30" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {blog && <Image src={blog.logoUrl} alt={blog.name} width={14} height={14} className="rounded-sm" />}
            <span className="text-xs font-semibold" style={{ color: blog?.color ?? "#6b7280" }}>{blog?.name ?? article.blog_id}</span>
            <span className="text-gray-200 dark:text-zinc-700">·</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-1">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 leading-relaxed">{article.summary}</p>
          )}
          {article.tags.length > 0 && (
            <div className="flex gap-1 mt-0.5">
              {article.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </a>
    );
  }

  if (layout === "large") {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex gap-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden p-5"
      >
        <div className="relative flex-shrink-0 w-48 h-36 rounded-xl bg-gray-100 dark:bg-zinc-800 overflow-hidden">
          {article.thumbnail ? (
            <Image src={article.thumbnail} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: blog ? `${blog.color}18` : "#f3f4f6" }}>
              {blog && <Image src={blog.logoUrl} alt={blog.name} width={48} height={48} className="opacity-30" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-2 py-1">
          <div className="flex items-center gap-2">
            {blog && <Image src={blog.logoUrl} alt={blog.name} width={16} height={16} className="rounded-sm" />}
            <span className="text-xs font-semibold" style={{ color: blog?.color ?? "#6b7280" }}>{blog?.name ?? article.blog_id}</span>
            <span className="text-gray-200 dark:text-zinc-700">·</span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2">
            {article.title}
          </h2>
          {article.summary && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{article.summary}</p>
          )}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto pt-1">
              {article.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </a>
    );
  }

  // grid
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="relative w-full h-44 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
        {article.thumbnail ? (
          <Image src={article.thumbnail} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: blog ? `${blog.color}18` : "#f3f4f6" }}>
            {blog && <Image src={blog.logoUrl} alt={blog.name} width={64} height={64} className="opacity-30" />}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {blog && <Image src={blog.logoUrl} alt={blog.name} width={18} height={18} className="rounded-sm" />}
            <span className="text-xs font-semibold" style={{ color: blog?.color ?? "#6b7280" }}>{blog?.name ?? article.blog_id}</span>
          </div>
          <span className="text-xs text-gray-400">{timeAgo}</span>
        </div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 leading-snug line-clamp-2">
          {article.title}
        </h2>
        {article.summary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{article.summary}</p>
        )}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}
