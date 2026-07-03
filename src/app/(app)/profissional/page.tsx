import { getUserAndProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GenerateInviteCodeButton } from "@/components/forms/GenerateInviteCodeButton";

export default async function ProfissionalPage() {
  const { user, profile } = await getUserAndProfile();
  const supabase = await createClient();

  const { data: links } = await supabase
    .from("professional_patient_links")
    .select("patient_id, created_at")
    .eq("professional_id", user!.id)
    .order("created_at", { ascending: false });

  const patients: { id: string; full_name: string; email: string }[] = [];
  for (const link of links ?? []) {
    const { data: patient } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", link.patient_id)
      .single();
    if (patient) patients.push({ id: link.patient_id, ...patient });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Olá, {profile!.full_name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Área do profissional</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          Convidar paciente
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Gere um código e compartilhe com o paciente para que ele se vincule à sua conta.
        </p>
        <div className="mt-4">
          <GenerateInviteCodeButton />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">
          Pacientes vinculados
        </h2>
        {patients.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Nenhum paciente vinculado ainda.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {patients.map((p) => (
              <li key={p.id} className="py-3">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {p.full_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{p.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
