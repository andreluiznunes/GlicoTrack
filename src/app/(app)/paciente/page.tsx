import Link from "next/link";
import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RedeemInviteForm } from "@/components/forms/RedeemInviteForm";
import { formatMeasuredAt } from "@/lib/format";
import { measurementContextLabel } from "@/lib/measurementContext";

export default async function PacientePage() {
  const { user, profile } = await getUserAndProfile();
  const supabase = await createClient();

  const { data: link } = await supabase
    .from("professional_patient_links")
    .select("professional_id")
    .eq("patient_id", user!.id)
    .maybeSingle();

  let professionalName: string | null = null;
  if (link) {
    const { data: professional } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", link.professional_id)
      .single();
    professionalName = professional?.full_name ?? null;
  }

  const { data: recentMeasurements } = await supabase
    .from("glucose_measurements")
    .select("*")
    .eq("patient_id", user!.id)
    .order("measured_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Olá, {profile!.full_name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Área do paciente</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          Profissional vinculado
        </h2>
        {professionalName ? (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{professionalName}</p>
        ) : (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Você ainda não está vinculado a nenhum profissional. Peça o código de convite ao seu
              médico, nutricionista ou educador em diabetes e informe abaixo.
            </p>
            <RedeemInviteForm />
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">Suas medições</h2>
          <Link href="/paciente/medicoes/nova" className="text-sm text-sky-600 hover:underline">
            + Nova medição
          </Link>
        </div>

        {!recentMeasurements || recentMeasurements.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Nenhuma medição registrada ainda.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
            {recentMeasurements.map((m) => (
              <li key={m.id} className="py-2">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {m.value_mg_dl} mg/dL
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatMeasuredAt(m.measured_at)} · {measurementContextLabel(m.context)}
                </p>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/paciente/medicoes"
          className="mt-3 inline-block text-sm text-sky-600 hover:underline"
        >
          Ver todas as medições
        </Link>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          Outros registros
        </h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link href="/paciente/doses" className="text-sky-600 hover:underline">
            Doses de medicação
          </Link>
          <Link href="/paciente/refeicoes" className="text-sky-600 hover:underline">
            Refeições
          </Link>
          <Link href="/paciente/atividades" className="text-sky-600 hover:underline">
            Atividades físicas
          </Link>
        </div>
      </section>
    </div>
  );
}
