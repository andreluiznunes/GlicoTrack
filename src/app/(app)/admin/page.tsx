import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { setProfessionalApproval } from "@/actions/admin";
import { Card } from "@/components/ui/Card";
import type { ApprovalStatus } from "@/types/database";

export const metadata: Metadata = { title: "Administração — GlicoTrack" };

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const STATUS_BADGE_CLASS: Record<ApprovalStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function ApprovalActionButton({
  professionalId,
  status,
  label,
  variant = "primary",
}: {
  professionalId: string;
  status: ApprovalStatus;
  label: string;
  variant?: "primary" | "danger" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "bg-teal-600 text-white hover:bg-teal-700"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700"
        : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";

  return (
    <form action={setProfessionalApproval}>
      <input type="hidden" name="professionalId" value={professionalId} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${classes}`}
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: professionals } = await supabase
    .from("profiles")
    .select("id, full_name, email, approval_status, created_at")
    .eq("role", "professional")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
          Administração
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Aprovação de cadastros de profissionais de saúde
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-medium text-slate-900 dark:text-slate-50">Profissionais</h2>
        {!professionals || professionals.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Nenhum profissional cadastrado ainda.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            {professionals.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    {p.full_name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{p.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[p.approval_status]}`}
                  >
                    {STATUS_LABEL[p.approval_status]}
                  </span>
                  {p.approval_status === "pending" && (
                    <>
                      <ApprovalActionButton
                        professionalId={p.id}
                        status="approved"
                        label="Aprovar"
                      />
                      <ApprovalActionButton
                        professionalId={p.id}
                        status="rejected"
                        label="Rejeitar"
                        variant="danger"
                      />
                    </>
                  )}
                  {p.approval_status === "approved" && (
                    <ApprovalActionButton
                      professionalId={p.id}
                      status="pending"
                      label="Revogar"
                      variant="secondary"
                    />
                  )}
                  {p.approval_status === "rejected" && (
                    <ApprovalActionButton
                      professionalId={p.id}
                      status="approved"
                      label="Aprovar"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
