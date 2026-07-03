"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
      </div>
      <SubmitButton>Enviar link de redefinição</SubmitButton>
    </form>
  );
}
