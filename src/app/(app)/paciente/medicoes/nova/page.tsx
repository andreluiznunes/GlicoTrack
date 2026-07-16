import type { Metadata } from "next";
import Link from "next/link";
import { createMeasurement } from "@/actions/measurements";
import { MeasurementForm } from "@/components/forms/MeasurementForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Nova medição — GlicoTrack" };

export default function NovaMedicaoPage() {
  const now = toDatetimeLocalBR(new Date().toISOString());

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/medicoes" className="text-sm text-teal-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Nova medição
        </h1>
      </div>
      <MeasurementForm
        action={createMeasurement}
        submitLabel="Registrar medição"
        defaultValues={{ measured_at_local: now }}
        maxMeasuredAtLocal={now}
      />
    </div>
  );
}
