import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// cache() dedupa a consulta a profiles entre layout e page na mesma request
// (getUser() já é revalidado pelo middleware antes de chegar aqui).
export const getUserAndProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, is_admin, approval_status")
    .eq("id", user.id)
    .single();

  if (profileError) {
    // Um usuário autenticado sem profile é sempre uma anomalia (RLS negando,
    // coluna faltando, linha inexistente) — vale logar o erro real do
    // Postgres/PostgREST em vez de deixar sumir num "null" silencioso.
    console.error("[getUserAndProfile] SELECT em profiles falhou:", {
      userId: user.id,
      message: profileError.message,
      code: profileError.code,
      details: profileError.details,
      hint: profileError.hint,
    });
  }

  return { user, profile };
});
