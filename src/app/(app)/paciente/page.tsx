import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RedeemInviteForm } from "@/components/forms/RedeemInviteForm";

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
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">Suas medições</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          O registro de medições de glicemia chega em uma próxima etapa do projeto.
        </p>
      </section>
    </div>
  );
}
