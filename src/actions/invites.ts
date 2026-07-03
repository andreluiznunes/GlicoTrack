"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type InviteActionState = { error?: string; code?: string } | undefined;

export async function generateInviteCode(
  _prevState: InviteActionState,
): Promise<InviteActionState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("generate_invite_code");

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profissional");
  return { code: data ?? undefined };
}

export type RedeemActionState = { error?: string } | undefined;

export async function redeemInviteCode(
  _prevState: RedeemActionState,
  formData: FormData,
): Promise<RedeemActionState> {
  const code = String(formData.get("code") ?? "")
    .trim()
    .toUpperCase();

  if (!code) {
    return { error: "Informe o código de convite." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("redeem_invite_code", { p_code: code });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente");
  redirect("/paciente");
}
