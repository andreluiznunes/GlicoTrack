"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MEASUREMENT_CONTEXTS } from "@/lib/measurementContext";
import type { MeasurementContext } from "@/types/database";

export type ActionState = { error?: string } | undefined;

const MEASUREMENT_CONTEXT_VALUES = MEASUREMENT_CONTEXTS.map((c) => c.value) as [
  MeasurementContext,
  ...MeasurementContext[],
];

const measurementSchema = z.object({
  value_mg_dl: z.coerce
    .number({ message: "Informe um valor numérico." })
    .int("O valor deve ser um número inteiro.")
    .min(1, "O valor deve ser maior que zero.")
    .max(999, "O valor deve ser menor que 1000."),
  measured_at: z.string().min(1, "Informe a data e hora da medição."),
  context: z.enum(MEASUREMENT_CONTEXT_VALUES, { message: "Selecione o momento da medição." }),
  notes: z.string().trim().optional(),
});

function parseMeasurementForm(formData: FormData) {
  return measurementSchema.safeParse({
    value_mg_dl: formData.get("value_mg_dl"),
    measured_at: formData.get("measured_at"),
    context: formData.get("context"),
    notes: formData.get("notes") || undefined,
  });
}

export async function createMeasurement(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseMeasurementForm(formData);

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

  const { error } = await supabase.from("glucose_measurements").insert({
    patient_id: user.id,
    value_mg_dl: parsed.data.value_mg_dl,
    measured_at: parsed.data.measured_at,
    context: parsed.data.context,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/medicoes");
  revalidatePath("/paciente");
  redirect("/paciente/medicoes");
}

const updateMeasurementSchema = measurementSchema.extend({
  id: z.string().uuid("Medição inválida."),
});

export async function updateMeasurement(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = updateMeasurementSchema.safeParse({
    id: formData.get("id"),
    value_mg_dl: formData.get("value_mg_dl"),
    measured_at: formData.get("measured_at"),
    context: formData.get("context"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createClient();
  const { id, value_mg_dl, measured_at, context, notes } = parsed.data;

  // Sem checagem manual de dono: a policy de UPDATE em glucose_measurements
  // já restringe a linhas com patient_id = auth.uid() (ver 0009_rls_policies.sql).
  const { error } = await supabase
    .from("glucose_measurements")
    .update({ value_mg_dl, measured_at, context, notes: notes || null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/paciente/medicoes");
  revalidatePath("/paciente");
  redirect("/paciente/medicoes");
}

export async function deleteMeasurement(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const supabase = await createClient();
  await supabase.from("glucose_measurements").delete().eq("id", id);

  revalidatePath("/paciente/medicoes");
  revalidatePath("/paciente");
}
