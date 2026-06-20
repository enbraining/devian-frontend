"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { IconLoader2, IconEye, IconEyeOff } from "@tabler/icons-react";

type Mode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

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

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setConfirm("");
    setShowConfirm(false);
  }

  const pwInput = (
    value: string,
    onChange: (v: string) => void,
    show: boolean,
    toggleShow: () => void,
    placeholder: string
  ) => (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={6}
        className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 dark:border-zinc-700 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600 outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
      />
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-zinc-600 hover:text-gray-500 dark:hover:text-zinc-400 transition-colors"
      >
        {show ? <IconEyeOff size={16} stroke={1.5} /> : <IconEye size={16} stroke={1.5} />}
      </button>
    </div>
  );

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
          {pwInput(password, setPassword, showPassword, () => setShowPassword((v) => !v), "비밀번호")}
          {mode === "signup" && pwInput(confirm, setConfirm, showConfirm, () => setShowConfirm((v) => !v), "비밀번호 확인")}

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
              <button onClick={() => switchMode("signup")} className="text-gray-700 dark:text-zinc-300 font-medium hover:underline">
                회원가입
              </button>
            </>
          ) : (
            <>이미 계정이 있으신가요?{" "}
              <button onClick={() => switchMode("login")} className="text-gray-700 dark:text-zinc-300 font-medium hover:underline">
                로그인
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
