"use client";

import { useState, useTransition } from "react";
import { toggleLike } from "@/actions/likes";
import { getFingerprint } from "@/lib/fingerprint";

interface LikeButtonProps {
  articleId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export default function LikeButton({
  articleId,
  initialLikeCount,
  initialIsLiked,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    // Optimistic update
    const nextIsLiked = !isLiked;
    setIsLiked(nextIsLiked);
    setLikeCount((prev) => (nextIsLiked ? prev + 1 : prev - 1));

    startTransition(async () => {
      try {
        const fingerprint = await getFingerprint();
        await toggleLike(articleId, fingerprint);
      } catch {
        // Revert on failure
        setIsLiked(!nextIsLiked);
        setLikeCount((prev) => (nextIsLiked ? prev - 1 : prev + 1));
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80 disabled:opacity-50"
      aria-label={isLiked ? "Unlike article" : "Like article"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={20}
        height={20}
        fill={isLiked ? "#ef4444" : "none"}
        stroke={isLiked ? "#ef4444" : "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{likeCount}</span>
    </button>
  );
}
