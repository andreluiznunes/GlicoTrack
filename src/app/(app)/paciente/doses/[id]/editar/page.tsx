import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateDose } from "@/actions/doses";
import { DoseForm } from "@/components/forms/DoseForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Editar dose — GlicoTrack" };

export default async function EditarDosePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: dose } = await supabase
    .from("medication_doses")
    .select("*")
    .eq("id", id)
    .single();

  if (!dose) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/doses" className="text-sm text-teal-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Editar dose
        </h1>
      </div>
      <DoseForm
        action={updateDose}
        submitLabel="Salvar alterações"
        defaultValues={{
          id: dose.id,
          medication_name: dose.medication_name,
          dose_amount: dose.dose_amount,
          dose_unit: dose.dose_unit,
          taken_at_local: toDatetimeLocalBR(dose.taken_at),
        }}
        maxTakenAtLocal={toDatetimeLocalBR(new Date().toISOString())}
      />
    </div>
  );
}
