import { getUser, syncBlogUser } from "@/lib/auth-server";

export async function POST() {
  const user = await getUser();
  if (!user?.email) return Response.json({ error: "Unauthorized" }, { status: 401 });
  await syncBlogUser(user.id, user.email);
  return Response.json({ ok: true });
}
