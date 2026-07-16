import type { Metadata } from "next";
import Link from "next/link";
import { createDose } from "@/actions/doses";
import { DoseForm } from "@/components/forms/DoseForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Nova dose — GlicoTrack" };

export default function NovaDosePage() {
  const now = toDatetimeLocalBR(new Date().toISOString());

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/doses" className="text-sm text-teal-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Nova dose
        </h1>
      </div>
      <DoseForm
        action={createDose}
        submitLabel="Registrar dose"
        defaultValues={{ taken_at_local: now }}
        maxTakenAtLocal={now}
      />
    </div>
  );
}
