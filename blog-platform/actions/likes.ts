"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleLike(articleId: string, fingerprint: string) {
  const supabase = createClient();

  if (!fingerprint) return { error: "No fingerprint provided" };

  // Check if already liked
  const { data: existing } = await supabase
    .from("article_likes")
    .select("id")
    .eq("article_id", articleId)
    .eq("fingerprint", fingerprint)
    .single();

  if (existing) {
    // Unlike
    const { error } = await supabase
      .from("article_likes")
      .delete()
      .eq("id", existing.id);

    if (error) return { error: error.message, liked: true };
    return { liked: false, error: null };
  } else {
    // Like
    const { error } = await supabase.from("article_likes").insert({
      article_id: articleId,
      fingerprint,
    });

    if (error) return { error: error.message, liked: false };
    return { liked: true, error: null };
  }
}

export async function getLikeInfo(articleId: string, fingerprint: string) {
  const supabase = createClient();

  const { count } = await supabase
    .from("article_likes")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId);

  let isLiked = false;
  if (fingerprint) {
    const { data } = await supabase
      .from("article_likes")
      .select("id")
      .eq("article_id", articleId)
      .eq("fingerprint", fingerprint)
      .single();
    isLiked = !!data;
  }

  return { count: count || 0, isLiked };
}
