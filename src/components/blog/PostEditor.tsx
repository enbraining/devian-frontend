"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  IconX, IconLoader2, IconPhoto, IconUpload,
  IconBold, IconItalic, IconCode, IconLink,
  IconH1, IconH2, IconList, IconBlockquote,
  IconEye, IconEdit,
} from "@tabler/icons-react";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), { ssr: false });

interface Props {
  authorId: string;
  initialData?: {
    slug: string;
    title: string;
    content: string;
    cover_url?: string;
    tags: string[];
    is_published: boolean;
  };
}

const TOOLBAR = [
  { icon: IconH1, label: "H1", wrap: ["# ", ""] },
  { icon: IconH2, label: "H2", wrap: ["## ", ""] },
  { icon: IconBold, label: "Bold", wrap: ["**", "**"] },
  { icon: IconItalic, label: "Italic", wrap: ["_", "_"] },
  { icon: IconCode, label: "Code", wrap: ["`", "`"] },
  { icon: IconLink, label: "Link", wrap: ["[", "](url)"] },
  { icon: IconBlockquote, label: "Quote", wrap: ["> ", ""] },
  { icon: IconList, label: "List", wrap: ["- ", ""] },
];

export default function PostEditor({ authorId, initialData }: Props) {
  const router = useRouter();
  const editorRef = useRef<{ view: EditorView } | null>(null);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [coverUrl, setCoverUrl] = useState(initialData?.cover_url ?? "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // 커버 이미지 업로드
  async function uploadCover(file: File) {
    setCoverUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/blog/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setCoverUrl(data.url);
    setCoverUploading(false);
  }

  function handleCoverDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) uploadCover(file);
  }

  // 툴바 버튼 — 선택 텍스트를 감싸거나 줄 앞에 삽입
  function insertWrap(before: string, after: string) {
    const view = editorRef.current?.view;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    const selected = view.state.sliceDoc(from, to);
    view.dispatch({
      changes: { from, to, insert: before + selected + after },
      selection: EditorSelection.cursor(from + before.length + selected.length + after.length),
    });
    view.focus();
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((p) => [...p, t]);
      setTagInput("");
    }
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
          cover_url: coverUrl || undefined,
          is_published: isPublished,
          tags,
          author_id: authorId,
        }),
      });
      const data = await res.json();
      if (data.slug) router.push(`/blog/${data.slug}`);
    } finally {
      setSaving(false);
    }
  }

  const editorTheme = EditorView.theme({
    "&": { background: "transparent" },
    ".cm-content": { padding: "0", fontFamily: "inherit", fontSize: "15px", lineHeight: "1.8" },
    ".cm-line": { padding: "0" },
    ".cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "inherit" },
    ".cm-placeholder": { color: "#9ca3af" },
  });

  const onEditorCreate = useCallback((view: EditorView) => {
    editorRef.current = { view };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !preview ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300"
            }`}
          >
            <IconEdit size={14} stroke={1.5} /> 편집
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              preview ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white" : "text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300"
            }`}
          >
            <IconEye size={14} stroke={1.5} /> 미리보기
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:border-gray-400 disabled:opacity-50 transition-colors"
          >
            임시저장
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving || !title.trim() || !content.trim()}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 disabled:opacity-50 transition-opacity"
          >
            {saving && <IconLoader2 size={13} className="animate-spin" />}
            발행
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-5 p-5 overflow-y-auto">
          {/* Cover image */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">커버 이미지</p>
            {coverUrl ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setCoverUrl("")}
                  className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <IconX size={12} stroke={2} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => coverInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleCoverDrop}
                disabled={coverUploading}
                className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                  dragOver
                    ? "border-gray-400 bg-gray-50 dark:bg-zinc-800"
                    : "border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"
                }`}
              >
                {coverUploading ? (
                  <IconLoader2 size={20} className="animate-spin text-gray-300" />
                ) : (
                  <>
                    <IconPhoto size={20} stroke={1.5} className="text-gray-300 dark:text-zinc-600" />
                    <span className="text-xs text-gray-300 dark:text-zinc-600">클릭 또는 드래그</span>
                  </>
                )}
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); }} />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">태그</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs text-gray-600 dark:text-zinc-400">
                  {t}
                  <button onClick={() => setTags((p) => p.filter((x) => x !== t))} className="text-gray-400 hover:text-red-400 transition-colors">
                    <IconX size={10} stroke={2} />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="태그 입력 후 Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent text-xs text-gray-700 dark:text-zinc-300 placeholder-gray-300 dark:placeholder-zinc-600 outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
            />
          </div>
        </aside>

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
          {/* Title */}
          <div className="px-10 pt-8 pb-4 border-b border-gray-100 dark:border-zinc-800">
            <input
              type="text"
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-200 dark:placeholder-zinc-800 resize-none"
            />
          </div>

          {/* Toolbar (편집 모드에서만) */}
          {!preview && (
            <div className="flex items-center gap-0.5 px-10 py-2 border-b border-gray-100 dark:border-zinc-800">
              {TOOLBAR.map(({ icon: Icon, label, wrap }) => (
                <button
                  key={label}
                  title={label}
                  onClick={() => insertWrap(wrap[0], wrap[1])}
                  className="w-7 h-7 flex items-center justify-center rounded text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Icon size={15} stroke={1.5} />
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-10 py-6">
            {preview ? (
              <div className="prose prose-gray dark:prose-invert max-w-none prose-pre:bg-zinc-900 prose-code:text-sm prose-headings:font-bold">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSlug]}>
                  {content || "_미리보기할 내용이 없습니다._"}
                </ReactMarkdown>
              </div>
            ) : (
              <CodeMirror
                value={content}
                onChange={setContent}
                onCreateEditor={onEditorCreate}
                extensions={[markdown({ base: markdownLanguage, codeLanguages: languages }), editorTheme]}
                basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false, syntaxHighlighting: true }}
                placeholder="본문을 입력하세요 (Markdown 지원)"
                height="100%"
                className="text-gray-900 dark:text-white h-full"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
