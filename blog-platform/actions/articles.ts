"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createArticle(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("category_id") as string;
  const status = formData.get("status") as string;

  if (!title || !content || !categoryId) {
    return { error: "Title, content, and category are required" };
  }

  let slug = generateSlug(title);

  // Handle slug collisions
  const { data: existing } = await supabase
    .from("articles")
    .select("slug")
    .like("slug", `${slug}%`);

  if (existing && existing.length > 0) {
    const slugs = new Set(existing.map((a) => a.slug));
    if (slugs.has(slug)) {
      let i = 1;
      while (slugs.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
  }

  const { error } = await supabase.from("articles").insert({
    title,
    slug,
    content,
    author_id: user.id,
    category_id: categoryId,
    status,
    published_at: status === "published" ? new Date().toISOString() : null,
  });

  if (error) return { error: error.message };

  revalidatePath("/author/my-articles");
  revalidatePath("/");
  return { success: true };
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = createClient();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("category_id") as string;
  const status = formData.get("status") as string;

  if (!title || !content || !categoryId) {
    return { error: "Title, content, and category are required" };
  }

  const updates: Record<string, unknown> = {
    title,
    content,
    category_id: categoryId,
    status,
    updated_at: new Date().toISOString(),
  };

  // Set published_at when first publishing
  if (status === "published") {
    const { data: existing } = await supabase
      .from("articles")
      .select("published_at")
      .eq("id", id)
      .single();

    if (!existing?.published_at) {
      updates.published_at = new Date().toISOString();
    }
  }

  const { error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/author/my-articles");
  revalidatePath("/");
  return { success: true };
}

export async function deleteArticle(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("articles").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/author/my-articles");
  revalidatePath("/");
  return { success: true };
}

export async function togglePublish(id: string, publish: boolean) {
  const supabase = createClient();

  const updates: Record<string, unknown> = {
    status: publish ? "published" : "draft",
    updated_at: new Date().toISOString(),
  };

  if (publish) {
    updates.published_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/author/my-articles");
  revalidatePath("/");
  return { success: true };
}

export async function getMyArticles() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", data: null };

  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name, slug)")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getArticleById(id: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name, slug), profiles(full_name)")
    .eq("id", id)
    .single();

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getArticleBySlug(slug: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name, slug), profiles(full_name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getPublishedArticles(categorySlug?: string, authorId?: string) {
  const supabase = createClient();

  let query = supabase
    .from("articles")
    .select("*, categories(name, slug), profiles(full_name)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  if (authorId) {
    query = query.eq("author_id", authorId);
  }

  const { data, error } = await query;

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function searchArticles(searchQuery: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, categories(name, slug), profiles(full_name)")
    .eq("status", "published")
    .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getRelatedArticles(categoryId: string, excludeId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("*, profiles(full_name)")
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) return { data: null };
  return { data };
}

export async function getAuthors() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");

  if (error) return { data: null };
  return { data };
}
