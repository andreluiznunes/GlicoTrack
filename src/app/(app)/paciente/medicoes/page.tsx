import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMeasuredAt } from "@/lib/format";
import { measurementContextLabel } from "@/lib/measurementContext";
import { DeleteMeasurementButton } from "@/components/DeleteMeasurementButton";

export const metadata: Metadata = { title: "Suas medições — GlicoTrack" };

export default async function MedicoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: measurements } = await supabase
    .from("glucose_measurements")
    .select("*")
    .eq("patient_id", user!.id)
    .order("measured_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/paciente" className="text-sm text-sky-600 hover:underline">
            ← Voltar
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Suas medições
          </h1>
        </div>
        <Link
          href="/paciente/medicoes/nova"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          + Nova medição
        </Link>
      </div>

      {!measurements || measurements.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma medição registrada ainda.
          </p>
          <Link
            href="/paciente/medicoes/nova"
            className="mt-4 inline-block text-sm text-sky-600 hover:underline"
          >
            Registrar primeira medição
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {measurements.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {m.value_mg_dl} <span className="text-sm font-normal">mg/dL</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatMeasuredAt(m.measured_at)} · {measurementContextLabel(m.context)}
                </p>
                {m.notes && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.notes}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <Link
                  href={`/paciente/medicoes/${m.id}/editar`}
                  className="text-sm text-sky-600 hover:underline"
                >
                  Editar
                </Link>
                <DeleteMeasurementButton id={m.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
