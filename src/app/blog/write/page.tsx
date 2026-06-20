import { getUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import PostEditor from "@/components/blog/PostEditor";

export default async function WritePage() {
  const user = await getUser();
  if (!user) redirect("/blog/login");

  return <PostEditor authorId={user.id} />;
}
