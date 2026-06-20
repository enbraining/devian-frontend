import { getUser } from "@/lib/auth-server";
import { getUserPosts } from "@/lib/blog-db";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/blog/DashboardClient";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/blog/login");

  const posts = await getUserPosts(user.id, false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <DashboardClient posts={posts} authorId={user.id} />
      </main>
    </div>
  );
}
