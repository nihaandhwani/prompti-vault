"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  if (!email || !fullName || !role || !password) {
    return { error: "All fields are required" };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin
    ? await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({
            email,
            password,
            email_confirm: true,
          }),
        }
      ).then(async (res) => {
        const data = await res.json();
        if (!res.ok) return { data: null, error: data };
        return { data, error: null };
      })
    : { data: null, error: { message: "Admin API not available" } };

  if (authError) {
    return { error: authError.message || "Failed to create auth user" };
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.id,
    email,
    full_name: fullName,
    role,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function getUsers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: null };
  return { data, error: null };
}
