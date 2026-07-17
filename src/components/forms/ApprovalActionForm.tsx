"use client";

import { useActionState } from "react";
import { setProfessionalApproval } from "@/actions/admin";
import { FormError } from "./FormError";
import type { ApprovalStatus } from "@/types/database";

const VARIANT_CLASS = {
  primary: "bg-teal-600 text-white hover:bg-teal-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  secondary:
    "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800",
};

export function ApprovalActionForm({
  professionalId,
  status,
  label,
  variant = "primary",
}: {
  professionalId: string;
  status: ApprovalStatus;
  label: string;
  variant?: keyof typeof VARIANT_CLASS;
}) {
  // Sem indicador de sucesso separado: como toda transição de status muda
  // qual botão é renderizado pra essa linha (ex.: "Aprovar" some, vira
  // "Revogar"), o próprio componente é desmontado assim que funciona — a
  // confirmação de sucesso é a badge de status mudando. Erro, por outro
  // lado, mantém o mesmo botão montado, então FormError aparece de verdade.
  const [state, formAction, isPending] = useActionState(setProfessionalApproval, undefined);

  return (
    <div className="flex flex-col items-end gap-1">
      <form action={formAction}>
        <input type="hidden" name="professionalId" value={professionalId} />
        <input type="hidden" name="status" value={status} />
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASS[variant]}`}
        >
          {isPending ? "Enviando..." : label}
        </button>
      </form>
      {state?.error && <FormError message={state.error} />}
    </div>
  );
}
