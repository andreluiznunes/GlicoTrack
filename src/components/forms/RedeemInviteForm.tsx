"use client";

import { useActionState } from "react";
import { redeemInviteCode } from "@/actions/invites";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";

export function RedeemInviteForm() {
  const [state, formAction] = useActionState(redeemInviteCode, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="code" className="block text-sm font-medium">
          Código do profissional
        </label>
        <input
          id="code"
          name="code"
          type="text"
          required
          placeholder="Ex.: 3F9A2B"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase tracking-wider dark:border-slate-700 dark:bg-slate-900"
        />
      </div>
      <FormError message={state?.error} />
      <SubmitButton>Vincular ao profissional</SubmitButton>
    </form>
  );
}
