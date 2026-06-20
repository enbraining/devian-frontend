import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserPosts } from "@/lib/blog-db";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/blog/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/blog/login");

  const posts = await getUserPosts(session.user.id, false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <DashboardClient posts={posts} />
      </main>
    </div>
  );
}
