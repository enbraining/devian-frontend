"use client";

import { useState, useEffect, useCallback } from "react";
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

  const roots = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  return (
    <section className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">댓글 {comments.length}</h3>
      <div className="flex flex-col gap-4">
        {roots.map((comment) => (
          <div key={comment.id} className="flex flex-col gap-3">
            <CommentItem comment={comment} onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)} isReplying={replyTo === comment.id} />
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

function CommentItem({ comment, onReply, isReplying }: { comment: Comment; onReply?: () => void; isReplying?: boolean }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-zinc-700">
        {comment.author.avatar_url && <Image src={comment.author.avatar_url} alt="" width={32} height={32} />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">{comment.author.name ?? comment.author.username}</span>
          <span className="text-xs text-gray-300 dark:text-zinc-600">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
}
