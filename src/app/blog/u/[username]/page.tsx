import { getUserByUsername, getUserPosts } from "@/lib/blog-db";
import { notFound } from "next/navigation";
import Image from "next/image";
import PostCard from "@/components/blog/PostCard";
import { IconBrandGithub } from "@tabler/icons-react";

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const handle = username;

  const user = await getUserByUsername(handle);
  if (!user) notFound();

  const posts = await getUserPosts(user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
        {/* Profile */}
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-800 flex-shrink-0">
            {user.avatar_url && <Image src={user.avatar_url} alt={user.name ?? user.username} width={64} height={64} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user.name ?? user.username}</h1>
              {user.github_url && (
                <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300">
                  <IconBrandGithub size={18} stroke={1.5} />
                </a>
              )}
            </div>
            <p className="text-sm text-gray-400 dark:text-zinc-500">@{user.username}</p>
            {user.bio && <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">{user.bio}</p>}
          </div>
        </div>

        {/* Posts */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400">게시글 {posts.length}</h2>
          {posts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">아직 게시글이 없습니다.</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </main>
    </div>
  );
}
