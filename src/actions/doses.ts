"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pastOrPresentTimestamp } from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

const doseSchema = z.object({
  medication_name: z.string().trim().min(1, "Informe o nome da medicação."),
  dose_amount: z.coerce
    .number({ message: "Informe um valor numérico." })
    .positive("A dose deve ser maior que zero."),
  dose_unit: z.string().trim().min(1, "Informe a unidade (ex.: UI, mg).").default("UI"),
  taken_at: pastOrPresentTimestamp(
    "A data e hora não podem estar no futuro.",
    "Informe a data e hora em que a dose foi tomada.",
  ),
});

function parseDoseForm(formData: FormData) {
  return doseSchema.safeParse({
    medication_name: formData.get("medication_name"),
    dose_amount: formData.get("dose_amount"),
    dose_unit: formData.get("dose_unit") || undefined,
    taken_at: formData.get("taken_at"),
  });
}

export async function createDose(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseDoseForm(formData);

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

  const { error } = await supabase.from("medication_doses").insert({
    patient_id: user.id,
    medication_name: parsed.data.medication_name,
    dose_amount: parsed.data.dose_amount,
    dose_unit: parsed.data.dose_unit,
    taken_at: parsed.data.taken_at,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/doses");
  revalidatePath("/paciente");
  redirect("/paciente/doses");
}

const updateDoseSchema = doseSchema.extend({
  id: z.string().uuid("Dose inválida."),
});

export async function updateDose(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = updateDoseSchema.safeParse({
    id: formData.get("id"),
    medication_name: formData.get("medication_name"),
    dose_amount: formData.get("dose_amount"),
    dose_unit: formData.get("dose_unit") || undefined,
    taken_at: formData.get("taken_at"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { id, medication_name, dose_amount, dose_unit, taken_at } = parsed.data;

  // Sem checagem manual de dono: a policy de UPDATE em medication_doses já
  // restringe a linhas com patient_id = auth.uid() (ver 0009_rls_policies.sql).
  const { error } = await supabase
    .from("medication_doses")
    .update({ medication_name, dose_amount, dose_unit, taken_at })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/doses");
  revalidatePath("/paciente");
  redirect("/paciente/doses");
}

export async function deleteDose(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const supabase = await createClient();
  await supabase.from("medication_doses").delete().eq("id", id);

  revalidatePath("/paciente/doses");
  revalidatePath("/paciente");
}
