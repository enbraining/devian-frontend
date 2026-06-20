"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      // 가입 후 blog_users 동기화
      await fetch("/api/blog/sync-user", { method: "POST" });
      setDone(true);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push("/blog");
      router.refresh();
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 flex flex-col items-center gap-4 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">이메일을 확인해주세요</h2>
          <p className="text-sm text-gray-400 dark:text-zinc-500">
            {email}로 인증 메일을 보냈습니다.<br />
            링크를 클릭하면 가입이 완료됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {mode === "login" ? "로그인" : "회원가입"}
          </h1>
          <p className="text-sm text-gray-400 dark:text-zinc-500">DEVIAN 블로그</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="사용자명 (영문, 숫자)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600 outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600 outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600 outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
          />

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity mt-1"
          >
            {loading && <IconLoader2 size={14} className="animate-spin" />}
            {mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 dark:text-zinc-500">
          {mode === "login" ? (
            <>계정이 없으신가요?{" "}
              <button onClick={() => { setMode("signup"); setError(""); }} className="text-gray-700 dark:text-zinc-300 font-medium hover:underline">
                회원가입
              </button>
            </>
          ) : (
            <>이미 계정이 있으신가요?{" "}
              <button onClick={() => { setMode("login"); setError(""); }} className="text-gray-700 dark:text-zinc-300 font-medium hover:underline">
                로그인
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
