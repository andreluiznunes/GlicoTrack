import type { Metadata } from "next";
import Link from "next/link";
import { createMeal } from "@/actions/meals";
import { MealForm } from "@/components/forms/MealForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Nova refeição — GlicoTrack" };

export default function NovaRefeicaoPage() {
  const now = toDatetimeLocalBR(new Date().toISOString());

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/refeicoes" className="text-sm text-sky-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Nova refeição
        </h1>
      </div>
      <MealForm
        action={createMeal}
        submitLabel="Registrar refeição"
        defaultValues={{ consumed_at_local: now }}
        maxConsumedAtLocal={now}
      />
    </div>
  );
}
