"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pastOrPresentTimestamp } from "@/lib/validation";

export type ActionState = { error?: string } | undefined;

const mealSchema = z.object({
  description: z.string().trim().min(1, "Descreva o que foi consumido."),
  carbs_grams: z.coerce.number().min(0, "Os carboidratos não podem ser negativos.").optional(),
  consumed_at: pastOrPresentTimestamp(
    "A data e hora não podem estar no futuro.",
    "Informe a data e hora da refeição.",
  ),
});

function parseMealForm(formData: FormData) {
  const carbsRaw = formData.get("carbs_grams");
  return mealSchema.safeParse({
    description: formData.get("description"),
    carbs_grams: carbsRaw ? carbsRaw : undefined,
    consumed_at: formData.get("consumed_at"),
  });
}

export async function createMeal(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseMealForm(formData);

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

  const { error } = await supabase.from("meals").insert({
    patient_id: user.id,
    description: parsed.data.description,
    carbs_grams: parsed.data.carbs_grams ?? null,
    consumed_at: parsed.data.consumed_at,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/refeicoes");
  revalidatePath("/paciente");
  redirect("/paciente/refeicoes");
}

const updateMealSchema = mealSchema.extend({
  id: z.string().uuid("Refeição inválida."),
});

export async function updateMeal(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const carbsRaw = formData.get("carbs_grams");
  const parsed = updateMealSchema.safeParse({
    id: formData.get("id"),
    description: formData.get("description"),
    carbs_grams: carbsRaw ? carbsRaw : undefined,
    consumed_at: formData.get("consumed_at"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { id, description, carbs_grams, consumed_at } = parsed.data;

  // Sem checagem manual de dono: a policy de UPDATE em meals já restringe a
  // linhas com patient_id = auth.uid() (ver 0009_rls_policies.sql).
  const { error } = await supabase
    .from("meals")
    .update({
      description,
      carbs_grams: carbs_grams ?? null,
      consumed_at,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/refeicoes");
  revalidatePath("/paciente");
  redirect("/paciente/refeicoes");
}

export async function deleteMeal(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const supabase = await createClient();
  await supabase.from("meals").delete().eq("id", id);

  revalidatePath("/paciente/refeicoes");
  revalidatePath("/paciente");
}
