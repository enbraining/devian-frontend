"use client";

import { useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IconX, IconLoader2 } from "@tabler/icons-react";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";

interface Props {
  initialData?: {
    slug: string;
    title: string;
    content: string;
    excerpt?: string;
    cover_url?: string;
    tags: string[];
    is_published: boolean;
  };
}

export default function PostEditor({ initialData }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [cover_url, setCoverUrl] = useState(initialData?.cover_url ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [saving, setSaving] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  async function save(isPublished: boolean) {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/blog/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: initialData?.slug,
          title,
          content,
          excerpt: excerpt || undefined,
          cover_url: cover_url || undefined,
          is_published: isPublished,
          tags,
        }),
      });
      const data = await res.json();
      if (data.slug) router.push(`/blog/${data.slug}`);
    } finally {
      setSaving(false);
    }
  }

  const theme = EditorView.theme({
    "&": { background: "transparent", fontSize: "15px" },
    ".cm-content": { padding: "16px 0", fontFamily: "inherit", lineHeight: "1.7" },
    ".cm-line": { padding: "0 4px" },
    ".cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "inherit" },
  });

  if (status === "loading") return null;
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500">로그인이 필요합니다.</p>
        <button
          onClick={() => signIn("github")}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:opacity-80 transition-opacity"
        >
          GitHub으로 로그인
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Title */}
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-200 dark:placeholder-zinc-700"
      />

      {/* Meta */}
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800">
        <input
          type="text"
          placeholder="한 줄 요약 (선택)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full text-sm bg-transparent border-none outline-none text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600"
        />
        <hr className="border-gray-100 dark:border-zinc-800" />
        <input
          type="text"
          placeholder="커버 이미지 URL (선택)"
          value={cover_url}
          onChange={(e) => setCoverUrl(e.target.value)}
          className="w-full text-sm bg-transparent border-none outline-none text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600"
        />
        <hr className="border-gray-100 dark:border-zinc-800" />
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs text-gray-600 dark:text-zinc-400">
              {t}
              <button onClick={() => removeTag(t)} className="text-gray-400 hover:text-red-400 transition-colors">
                <IconX size={10} stroke={2} />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="태그 추가 (Enter)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addTag(); }
            }}
            className="text-sm bg-transparent border-none outline-none text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600 min-w-24"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <CodeMirror
          value={content}
          onChange={setContent}
          extensions={[
            markdown({ base: markdownLanguage, codeLanguages: languages }),
            theme,
          ]}
          basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
          placeholder="본문을 입력하세요 (Markdown 지원)"
          height="500px"
          className="text-gray-900 dark:text-white"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => save(false)}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:border-gray-400 disabled:opacity-50 transition-colors"
        >
          임시저장
        </button>
        <button
          onClick={() => save(true)}
          disabled={saving || !title.trim() || !content.trim()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving && <IconLoader2 size={14} className="animate-spin" />}
          발행
        </button>
      </div>
    </div>
  );
}
