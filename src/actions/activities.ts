"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pastOrPresentTimestamp } from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

const activitySchema = z.object({
  description: z.string().trim().min(1, "Descreva a atividade."),
  duration_minutes: z.coerce
    .number({ message: "Informe um valor numérico." })
    .int("A duração deve ser um número inteiro de minutos.")
    .positive("A duração deve ser maior que zero.")
    .optional(),
  performed_at: pastOrPresentTimestamp(
    "A data e hora não podem estar no futuro.",
    "Informe a data e hora da atividade.",
  ),
});

function parseActivityForm(formData: FormData) {
  const durationRaw = formData.get("duration_minutes");
  return activitySchema.safeParse({
    description: formData.get("description"),
    duration_minutes: durationRaw ? durationRaw : undefined,
    performed_at: formData.get("performed_at"),
  });
}

export async function createActivity(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseActivityForm(formData);

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

  const { error } = await supabase.from("activities").insert({
    patient_id: user.id,
    description: parsed.data.description,
    duration_minutes: parsed.data.duration_minutes ?? null,
    performed_at: parsed.data.performed_at,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/atividades");
  revalidatePath("/paciente");
  redirect("/paciente/atividades");
}

const updateActivitySchema = activitySchema.extend({
  id: z.string().uuid("Atividade inválida."),
});

export async function updateActivity(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const durationRaw = formData.get("duration_minutes");
  const parsed = updateActivitySchema.safeParse({
    id: formData.get("id"),
    description: formData.get("description"),
    duration_minutes: durationRaw ? durationRaw : undefined,
    performed_at: formData.get("performed_at"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { id, description, duration_minutes, performed_at } = parsed.data;

  // Sem checagem manual de dono: a policy de UPDATE em activities já
  // restringe a linhas com patient_id = auth.uid() (ver 0009_rls_policies.sql).
  const { error } = await supabase
    .from("activities")
    .update({ description, duration_minutes: duration_minutes ?? null, performed_at })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/atividades");
  revalidatePath("/paciente");
  redirect("/paciente/atividades");
}

export async function deleteActivity(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const supabase = await createClient();
  await supabase.from("activities").delete().eq("id", id);

  revalidatePath("/paciente/atividades");
  revalidatePath("/paciente");
}
