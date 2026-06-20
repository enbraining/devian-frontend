import BlogFeedPage from "@/components/blog/BlogFeedPage";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <BlogFeedPage />
      </main>
    </div>
  );
}
