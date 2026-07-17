"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string } | undefined;

const approvalSchema = z.object({
  professionalId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export async function setProfessionalApproval(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = approvalSchema.safeParse({
    professionalId: formData.get("professionalId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();
  // RPC confere is_admin de quem chama e restringe a profissionais
  // (0012_professional_approval.sql).
  const { error } = await supabase.rpc("set_professional_approval", {
    p_professional_id: parsed.data.professionalId,
    p_status: parsed.data.status,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin");
}
