import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { estimateHbA1c } from "@/lib/hba1c";
import { daysAgoIso } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { GlucoseChart } from "@/components/GlucoseChart";
import { TargetForm } from "@/components/forms/TargetForm";

export const metadata: Metadata = { title: "Paciente — GlicoTrack" };

export default async function PacienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Confere o vínculo antes de mais nada: sem ele, 404 direto (RLS já
  // bloquearia as leituras abaixo de qualquer forma, mas assim evita montar
  // uma página com tudo vazio pra um paciente não vinculado).
  const { data: link } = await supabase
    .from("professional_patient_links")
    .select("patient_id")
    .eq("professional_id", user!.id)
    .eq("patient_id", id)
    .maybeSingle();

  if (!link) {
    notFound();
  }

  const { data: patient } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", id)
    .single();

  if (!patient) {
    notFound();
  }

  const { data: recentMeasurements } = await supabase
    .from("glucose_measurements")
    .select("measured_at, value_mg_dl")
    .eq("patient_id", id)
    .gte("measured_at", daysAgoIso(90))
    .order("measured_at", { ascending: true });

  const { data: target } = await supabase
    .from("patient_targets")
    .select("min_mg_dl, max_mg_dl, notes")
    .eq("patient_id", id)
    .eq("professional_id", user!.id)
    .maybeSingle();

  const hba1c = estimateHbA1c((recentMeasurements ?? []).map((m) => m.value_mg_dl));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/profissional" className="text-sm text-teal-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          {patient.full_name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{patient.email}</p>
      </div>

      <Card>
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          Evolução (últimos 90 dias)
        </h2>
        {!recentMeasurements || recentMeasurements.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sem medições nos últimos 90 dias.
          </p>
        ) : (
          <div className="mt-4">
            <GlucoseChart measurements={recentMeasurements} target={target ?? null} />
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">HbA1c estimado</h2>
        {hba1c ? (
          <>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-50">
              {hba1c.percentage}%
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Média de {hba1c.averageGlucose} mg/dL em {hba1c.sampleSize} medições (últimos 90
              dias)
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Dados insuficientes nos últimos 90 dias para estimar.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          Meta de glicemia
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Defina a faixa considerada normal para este paciente — valores fora dela aparecem
          destacados no gráfico dele.
        </p>
        <div className="mt-4">
          <TargetForm
            patientId={id}
            defaultValues={
              target
                ? {
                    min_mg_dl: target.min_mg_dl,
                    max_mg_dl: target.max_mg_dl,
                    notes: target.notes,
                  }
                : undefined
            }
          />
        </div>
      </Card>
    </div>
  );
}
