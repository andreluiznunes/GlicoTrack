"use client";

import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Nova senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>
      <SubmitButton>Redefinir senha</SubmitButton>
    </form>
  );
}
