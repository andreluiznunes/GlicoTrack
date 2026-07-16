"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { FormError } from "./FormError";

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900";

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormError message={state?.error} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Eu sou</legend>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="role" value="patient" defaultChecked required />
            Paciente
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="role" value="professional" />
            Profissional de saúde
          </label>
        </div>
      </fieldset>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Nome completo
        </label>
        <input id="fullName" name="fullName" type="text" required autoComplete="name" className={inputClass} />
      </div>

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
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="termsAccepted" required className="mt-1" />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" className="text-teal-600 hover:underline" target="_blank">
            termos de uso e a política de privacidade
          </Link>
          .
        </span>
      </label>

      <SubmitButton>Criar conta</SubmitButton>

      <p className="text-center text-sm">
        Já tem conta?{" "}
        <Link href="/login" className="text-teal-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
