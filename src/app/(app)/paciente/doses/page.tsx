import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteDose } from "@/actions/doses";
import { formatMeasuredAt } from "@/lib/format";
import { DeleteButton } from "@/components/DeleteButton";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "Doses de medicação — GlicoTrack" };

export default async function DosesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: doses } = await supabase
    .from("medication_doses")
    .select("*")
    .eq("patient_id", user!.id)
    .order("taken_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/paciente" className="text-sm text-teal-600 hover:underline">
            ← Voltar
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Doses de medicação
          </h1>
        </div>
        <ButtonLink href="/paciente/doses/nova">+ Nova dose</ButtonLink>
      </div>

      {!doses || doses.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma dose registrada ainda.
          </p>
          <Link
            href="/paciente/doses/nova"
            className="mt-4 inline-block text-sm text-teal-600 hover:underline"
          >
            Registrar primeira dose
          </Link>
        </Card>
      ) : (
        <Card as="ul" padded={false} className="divide-y divide-slate-200 dark:divide-slate-800">
          {doses.map((d) => (
            <li key={d.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {d.medication_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {d.dose_amount} {d.dose_unit} · {formatMeasuredAt(d.taken_at)}
                </p>
              </div>
              <div className="flex shrink-0 gap-3">
                <Link
                  href={`/paciente/doses/${d.id}/editar`}
                  className="text-sm text-teal-600 hover:underline"
                >
                  Editar
                </Link>
                <DeleteButton
                  action={deleteDose}
                  id={d.id}
                  confirmMessage="Excluir esta dose? Essa ação não pode ser desfeita."
                />
              </div>
            </li>
          ))}
        </Card>
      )}
    </div>
  );
}
