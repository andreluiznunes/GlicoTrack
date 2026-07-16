"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string } | undefined;

const targetSchema = z
  .object({
    patientId: z.string().uuid("Paciente inválido."),
    min_mg_dl: z.coerce
      .number({ message: "Informe um valor numérico." })
      .int("O valor mínimo deve ser um número inteiro.")
      .positive("O valor mínimo deve ser maior que zero."),
    max_mg_dl: z.coerce
      .number({ message: "Informe um valor numérico." })
      .int("O valor máximo deve ser um número inteiro.")
      .positive("O valor máximo deve ser maior que zero."),
    notes: z.string().trim().optional(),
  })
  .refine((data) => data.max_mg_dl > data.min_mg_dl, {
    message: "O valor máximo deve ser maior que o mínimo.",
    path: ["max_mg_dl"],
  });

export async function setPatientTarget(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = targetSchema.safeParse({
    patientId: formData.get("patientId"),
    min_mg_dl: formData.get("min_mg_dl"),
    max_mg_dl: formData.get("max_mg_dl"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  const { patientId, min_mg_dl, max_mg_dl, notes } = parsed.data;

  // RLS de patient_targets_insert/_update já exige professional_id = auth.uid()
  // e vínculo ativo com o paciente (0009_rls_policies.sql) — upsert em vez de
  // insert/update separados porque unique(patient_id, professional_id) garante
  // no máximo uma meta ativa por par paciente-profissional.
  const { error } = await supabase.from("patient_targets").upsert(
    {
      patient_id: patientId,
      professional_id: user.id,
      min_mg_dl,
      max_mg_dl,
      notes: notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "patient_id,professional_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/profissional/pacientes/${patientId}`);
  revalidatePath("/paciente/medicoes");
  redirect(`/profissional/pacientes/${patientId}`);
}
