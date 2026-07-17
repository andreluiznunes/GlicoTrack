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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, is_admin, approval_status")
    .eq("id", user.id)
    .single();

  return { user, profile };
});
