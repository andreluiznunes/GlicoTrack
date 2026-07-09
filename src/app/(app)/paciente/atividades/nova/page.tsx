import type { Metadata } from "next";
import Link from "next/link";
import { createActivity } from "@/actions/activities";
import { ActivityForm } from "@/components/forms/ActivityForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Nova atividade — GlicoTrack" };

export default function NovaAtividadePage() {
  const now = toDatetimeLocalBR(new Date().toISOString());

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/atividades" className="text-sm text-sky-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Nova atividade
        </h1>
      </div>
      <ActivityForm
        action={createActivity}
        submitLabel="Registrar atividade"
        defaultValues={{ performed_at_local: now }}
        maxPerformedAtLocal={now}
      />
    </div>
  );
}
