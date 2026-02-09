"use server";

import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Category name is required" };

  const slug = generateSlug(name);

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description: description || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Category already exists" };
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) return { error: "Category name is required" };

  const slug = generateSlug(name);

  const { error } = await supabase
    .from("categories")
    .update({ name, slug, description: description || null })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) {
    if (error.code === "23503")
      return { error: "Cannot delete category with articles" };
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}

export async function getCategoriesWithCounts() {
  const supabase = createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) return { error: error.message, data: null };

  // Get article counts per category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (cat) => {
      const { count } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("category_id", cat.id)
        .eq("status", "published");
      return { ...cat, article_count: count || 0 };
    })
  );

  return { data: categoriesWithCounts, error: null };
}
