import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { createClient } from "@supabase/supabase-js";
import slugify from "slugify";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github") return false;
      const supabase = getAdminSupabase();
      const githubProfile = profile as Record<string, unknown>;

      const rawUsername = (githubProfile.login as string) ?? user.email?.split("@")[0] ?? "user";
      const baseUsername = slugify(rawUsername, { lower: true, strict: true });

      const { data: existing } = await supabase
        .from("blog_users")
        .select("id")
        .eq("id", user.id!)
        .single();

      if (!existing) {
        let username = baseUsername;
        let attempt = 0;
        while (true) {
          const { data: taken } = await supabase
            .from("blog_users")
            .select("id")
            .eq("username", username)
            .neq("id", user.id!)
            .single();
          if (!taken) break;
          attempt++;
          username = `${baseUsername}${attempt}`;
        }

        await supabase.from("blog_users").insert({
          id: user.id!,
          username,
          name: user.name ?? rawUsername,
          email: user.email,
          avatar_url: user.image,
          github_url: `https://github.com/${rawUsername}`,
        });
      } else {
        await supabase
          .from("blog_users")
          .update({ name: user.name, avatar_url: user.image })
          .eq("id", user.id!);
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },

    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        const supabase = getAdminSupabase();
        const { data } = await supabase
          .from("blog_users")
          .select("username, avatar_url")
          .eq("id", token.sub)
          .single();
        if (data) {
          (session.user as typeof session.user & { username: string }).username = data.username;
          session.user.image = data.avatar_url;
        }
      }
      return session;
    },
  },
  pages: { signIn: "/blog/login" },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
