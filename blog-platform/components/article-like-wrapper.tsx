"use client";

import { useEffect, useState } from "react";
import LikeButton from "@/components/like-button";
import { getFingerprint } from "@/lib/fingerprint";
import { getLikeInfo } from "@/actions/likes";

interface ArticleLikeWrapperProps {
  articleId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export default function ArticleLikeWrapper({
  articleId,
  initialLikeCount,
  initialIsLiked,
}: ArticleLikeWrapperProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function fetchWithFingerprint() {
      try {
        const fingerprint = await getFingerprint();
        const info = await getLikeInfo(articleId, fingerprint);
        setLikeCount(info.count);
        setIsLiked(info.isLiked);
      } catch {
        // Fall back to server-provided values
      } finally {
        setReady(true);
      }
    }
    fetchWithFingerprint();
  }, [articleId]);

  return (
    <LikeButton
      articleId={articleId}
      initialLikeCount={likeCount}
      initialIsLiked={ready ? isLiked : initialIsLiked}
    />
  );
}
