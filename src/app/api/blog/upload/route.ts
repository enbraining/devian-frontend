import { getUser } from "@/lib/auth-server";
import { createClient } from "@supabase/supabase-js";

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowed.includes(file.type)) return Response.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${Date.now()}.${ext}`;

  const supabase = adminSupabase();
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from("blog-images")
    .getPublicUrl(path);

  return Response.json({ url: publicUrl });
}
