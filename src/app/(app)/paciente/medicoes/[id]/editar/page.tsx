import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateMeasurement } from "@/actions/measurements";
import { MeasurementForm } from "@/components/forms/MeasurementForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Editar medição — GlicoTrack" };

export default async function EditarMedicaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Sem checagem manual de dono: a policy de SELECT em glucose_measurements só
  // retorna a linha se for do próprio paciente (ou de um profissional
  // vinculado, que não acessa esta rota) — se não vier nada, é 404, sem
  // vazar se a medição existe e é de outra pessoa.
  const { data: measurement } = await supabase
    .from("glucose_measurements")
    .select("*")
    .eq("id", id)
    .single();

  if (!measurement) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/medicoes" className="text-sm text-teal-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Editar medição
        </h1>
      </div>
      <MeasurementForm
        action={updateMeasurement}
        submitLabel="Salvar alterações"
        defaultValues={{
          id: measurement.id,
          value_mg_dl: measurement.value_mg_dl,
          measured_at_local: toDatetimeLocalBR(measurement.measured_at),
          context: measurement.context,
          notes: measurement.notes,
        }}
        maxMeasuredAtLocal={toDatetimeLocalBR(new Date().toISOString())}
      />
    </div>
  );
}
