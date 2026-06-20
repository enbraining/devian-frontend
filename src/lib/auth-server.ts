import { createClient } from "./supabase-server-client";
import { createClient as createAdmin } from "@supabase/supabase-js";
import slugify from "slugify";

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function syncBlogUser(userId: string, email: string) {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: existing } = await admin
    .from("blog_users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existing) {
    const base = slugify(email.split("@")[0], { lower: true, strict: true }) || "user";
    let username = base;
    let attempt = 0;
    while (true) {
      const { data: taken } = await admin
        .from("blog_users")
        .select("id")
        .eq("username", username)
        .neq("id", userId)
        .single();
      if (!taken) break;
      username = `${base}${++attempt}`;
    }
    await admin.from("blog_users").insert({ id: userId, username, email });
  }
}
