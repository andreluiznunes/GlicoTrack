import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteMeal } from "@/actions/meals";
import { formatMeasuredAt } from "@/lib/format";
import { DeleteButton } from "@/components/DeleteButton";

export const metadata: Metadata = { title: "Refeições — GlicoTrack" };

export default async function RefeicoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("patient_id", user!.id)
    .order("consumed_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/paciente" className="text-sm text-sky-600 hover:underline">
            ← Voltar
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Refeições
          </h1>
        </div>
        <Link
          href="/paciente/refeicoes/nova"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          + Nova refeição
        </Link>
      </div>

      {!meals || meals.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma refeição registrada ainda.
          </p>
          <Link
            href="/paciente/refeicoes/nova"
            className="mt-4 inline-block text-sm text-sky-600 hover:underline"
          >
            Registrar primeira refeição
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {meals.map((m) => (
            <li key={m.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {m.description}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {m.carbs_grams != null ? `${m.carbs_grams}g de carboidratos · ` : ""}
                  {formatMeasuredAt(m.consumed_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Link
                  href={`/paciente/refeicoes/${m.id}/editar`}
                  className="text-sm text-sky-600 hover:underline"
                >
                  Editar
                </Link>
                <DeleteButton
                  action={deleteMeal}
                  id={m.id}
                  confirmMessage="Excluir esta refeição? Essa ação não pode ser desfeita."
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
