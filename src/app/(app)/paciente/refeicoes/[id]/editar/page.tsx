import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateMeal } from "@/actions/meals";
import { MealForm } from "@/components/forms/MealForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Editar refeição — GlicoTrack" };

export default async function EditarRefeicaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: meal } = await supabase.from("meals").select("*").eq("id", id).single();

  if (!meal) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/refeicoes" className="text-sm text-teal-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Editar refeição
        </h1>
      </div>
      <MealForm
        action={updateMeal}
        submitLabel="Salvar alterações"
        defaultValues={{
          id: meal.id,
          description: meal.description,
          carbs_grams: meal.carbs_grams,
          consumed_at_local: toDatetimeLocalBR(meal.consumed_at),
        }}
        maxConsumedAtLocal={toDatetimeLocalBR(new Date().toISOString())}
      />
    </div>
  );
}
