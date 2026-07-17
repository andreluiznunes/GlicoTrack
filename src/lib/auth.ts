import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// cache() dedupa a consulta a profiles entre layout e page na mesma request
// (getUser() já é revalidado pelo middleware antes de chegar aqui).
export const getUserAndProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[getUserAndProfile] getUser() falhou:", {
      message: userError.message,
      status: userError.status,
      code: userError.code,
    });
  }

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, is_admin, approval_status")
    .eq("id", user.id)
    .single();

  if (profileError) {
    // Isso é o que mais importa depurar: se a coluna não existir, se RLS
    // negar, ou se simplesmente não existir linha pra esse user.id, o erro
    // real do Postgres/PostgREST aparece aqui em vez de sumir num "null".
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
