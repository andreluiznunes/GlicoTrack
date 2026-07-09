import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateActivity } from "@/actions/activities";
import { ActivityForm } from "@/components/forms/ActivityForm";
import { toDatetimeLocalBR } from "@/lib/format";

export const metadata: Metadata = { title: "Editar atividade — GlicoTrack" };

export default async function EditarAtividadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: activity } = await supabase.from("activities").select("*").eq("id", id).single();

  if (!activity) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <Link href="/paciente/atividades" className="text-sm text-sky-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Editar atividade
        </h1>
      </div>
      <ActivityForm
        action={updateActivity}
        submitLabel="Salvar alterações"
        defaultValues={{
          id: activity.id,
          description: activity.description,
          duration_minutes: activity.duration_minutes,
          performed_at_local: toDatetimeLocalBR(activity.performed_at),
        }}
        maxPerformedAtLocal={toDatetimeLocalBR(new Date().toISOString())}
      />
    </div>
  );
}
