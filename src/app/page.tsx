import ArticleFeed from "@/components/ArticleFeed";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <ArticleFeed />
      </main>
    </div>
  );
}
