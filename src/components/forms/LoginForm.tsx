"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          E-mail
        </label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <SubmitButton>Entrar</SubmitButton>
      <div className="flex justify-between text-sm">
        <Link href="/cadastro" className="text-sky-600 hover:underline">
          Criar conta
        </Link>
        <Link href="/esqueci-senha" className="text-sky-600 hover:underline">
          Esqueci minha senha
        </Link>
      </div>
    </form>
  );
}
