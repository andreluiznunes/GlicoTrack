"use client";

import { useActionState } from "react";
import { generateInviteCode } from "@/actions/invites";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";

export function GenerateInviteCodeButton() {
  const [state, formAction] = useActionState(generateInviteCode, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <FormError message={state?.error} />
      {state?.code && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          Código gerado: <span className="font-mono font-semibold">{state.code}</span> (válido por
          72 horas)
        </p>
      )}
      <SubmitButton>Gerar código de convite</SubmitButton>
    </form>
  );
}
