import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteActivity } from "@/actions/activities";
import { formatMeasuredAt } from "@/lib/format";
import { DeleteButton } from "@/components/DeleteButton";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "Atividades físicas — GlicoTrack" };

export default async function AtividadesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("patient_id", user!.id)
    .order("performed_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/paciente" className="text-sm text-teal-600 hover:underline">
            ← Voltar
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Atividades físicas
          </h1>
        </div>
        <ButtonLink href="/paciente/atividades/nova">+ Nova atividade</ButtonLink>
      </div>

      {!activities || activities.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma atividade registrada ainda.
          </p>
          <Link
            href="/paciente/atividades/nova"
            className="mt-4 inline-block text-sm text-teal-600 hover:underline"
          >
            Registrar primeira atividade
          </Link>
        </Card>
      ) : (
        <Card as="ul" padded={false} className="divide-y divide-slate-200 dark:divide-slate-800">
          {activities.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {a.description}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {a.duration_minutes != null ? `${a.duration_minutes} min · ` : ""}
                  {formatMeasuredAt(a.performed_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Link
                  href={`/paciente/atividades/${a.id}/editar`}
                  className="text-sm text-teal-600 hover:underline"
                >
                  Editar
                </Link>
                <DeleteButton
                  action={deleteActivity}
                  id={a.id}
                  confirmMessage="Excluir esta atividade? Essa ação não pode ser desfeita."
                />
              </div>
            </li>
          ))}
        </Card>
      )}
    </div>
  );
}
