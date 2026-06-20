"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  author: { username: string; name: string | null; avatar_url: string | null };
}

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadComments = useCallback(async () => {
    const res = await fetch(`/api/blog/comment?postId=${postId}`);
    const data = await res.json();
    setComments(data.comments ?? []);
  }, [postId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  async function submit(parentId?: string) {
    if (!text.trim()) return;
    setLoading(true);
    await fetch("/api/blog/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, content: text, parentId }),
    });
    setText("");
    setReplyTo(null);
    await loadComments();
    setLoading(false);
  }

  const roots = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">댓글 {comments.length}</h3>

      {session ? (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-zinc-700">
            {session.user.image && <Image src={session.user.image} alt="" width={32} height={32} />}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="댓글을 입력하세요..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600 resize-none outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
            />
            <div className="flex justify-end">
              <button
                onClick={() => submit()}
                disabled={loading || !text.trim()}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 disabled:opacity-40 transition-opacity"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          <button onClick={() => signIn("github")} className="text-gray-700 dark:text-zinc-300 underline">
            로그인
          </button>
          하면 댓글을 남길 수 있습니다.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {roots.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-3">
            <CommentItem
              comment={comment}
              onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              isReplying={replyTo === comment.id}
            />
            {replyTo === comment.id && session && (
              <div className="ml-10 flex gap-3">
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-zinc-700">
                  {session.user.image && <Image src={session.user.image} alt="" width={28} height={28} />}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="답글을 입력하세요..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-zinc-600 resize-none outline-none focus:border-gray-400 dark:focus:border-zinc-500 transition-colors"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setReplyTo(null)} className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5">취소</button>
                    <button
                      onClick={() => submit(comment.id)}
                      disabled={loading || !text.trim()}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-80 disabled:opacity-40 transition-opacity"
                    >
                      등록
                    </button>
                  </div>
                </div>
              </div>
            )}
            {replies(comment.id).map((reply) => (
              <div key={reply.id} className="ml-10">
                <CommentItem comment={reply} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  onReply,
  isReplying,
}: {
  comment: Comment;
  onReply?: () => void;
  isReplying?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-zinc-700">
        {comment.author.avatar_url && (
          <Image src={comment.author.avatar_url} alt="" width={32} height={32} />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
            {comment.author.name ?? comment.author.username}
          </span>
          <span className="text-xs text-gray-300 dark:text-zinc-600">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{comment.content}</p>
        {onReply && (
          <button
            onClick={onReply}
            className={`mt-1 text-xs transition-colors ${isReplying ? "text-blue-500" : "text-gray-300 dark:text-zinc-600 hover:text-gray-500"}`}
          >
            답글
          </button>
        )}
      </div>
    </div>
  );
}
